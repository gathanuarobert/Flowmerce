from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
import logging
logger = logging.getLogger(__name__)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Product, Order, OrderItem
from .serializers import UserSerializer, ProductSerializer, OrderSerializer, OrderItemSerializer

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = CustomPagination
    
class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'access': str(token.access_token),
                'refresh': str(token)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    
    
class UserLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email')    
            password = request.data.get('password')
            
            if not email or not password:
                return Response(
                    {'error': 'Email and password required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(request, email=email, password=password)  # <-- Changed `name` to `email`
            
            if not user:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")  # Use logger instead of print
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    
class UserLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Log out successfully'}, status=status.HTTP_205_RESET_CONTENT)
    
class ProductListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = CustomPagination

class ProductCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer   

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer         

class OrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = CustomPagination

class OrderCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer   

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

class IsOrderOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.employee == request.user

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAdminUser | IsOrderOwner]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
