from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Avg, Count
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework import parsers, generics
import logging
from django.db.models.functions import TruncMonth
from datetime import datetime
logger = logging.getLogger(__name__)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils.text import slugify
from .models import User, Product, Order, OrderItem, Category, Tag
from .serializers import UserSerializer, ProductSerializer, OrderSerializer, OrderItemSerializer, CategorySerializer, TagSerializer

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

            user = authenticate(request, email=email, password=password)
            
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
            logger.error(f"Login error: {str(e)}")
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

# Consolidated Product ViewSet (replaces ProductListView, ProductCreateView, and ProductDetailView)
class ProductViewSet(viewsets.ModelViewSet):
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = CustomPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        # employee set in serializer.create(), so this can stay empty or omitted
        serializer.save()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Auto-generate slug if not provided
        if 'slug' not in serializer.validated_data:
            serializer.validated_data['slug'] = slugify(serializer.validated_data['title'])
        serializer.save()

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer  
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

from django.http import JsonResponse
from django.urls import get_resolver

def show_all_urls(request):
    """Debug view to show all registered URLs"""
    resolver = get_resolver()
    url_list = []
    
    def collect_urls(url_patterns, prefix=''):
        for pattern in url_patterns:
            if hasattr(pattern, 'url_patterns'):
                collect_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            else:
                url_list.append(prefix + str(pattern.pattern))
    
    collect_urls(resolver.url_patterns)
    return JsonResponse({'urls': url_list})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_summary(request):
    total_orders = Order.objects.count()
    total_revenue = Order.objects.aggregate(total=Sum('amount'))['total'] or 0
    avg_order_value = Order.objects.aggregate(avg=Avg('amount'))['avg'] or 0
    total_products = Product.objects.count()

    top_products = (
        OrderItem.objects.values('product__title')
        .annotate(total_sold=Sum('quantity'))
        .order_by('-total_sold')[:5]
    )

    status_counts = (
        Order.objects.values('status')
        .annotate(count=Count('status'))
    )

    return Response({
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": avg_order_value,
        "total_products": total_products,
        "top_products": top_products,
        "status_counts": status_counts,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_sales(request):
    from datetime import datetime
    from django.db.models.functions import TruncMonth
    from django.db.models import Sum

    year = request.GET.get('year')
    category_id = request.GET.get('category')

    queryset = Order.objects.all()

    # Filter by year
    if year:
        queryset = queryset.filter(created_at__year=year)

    # Filter by category if given
    if category_id:
        queryset = queryset.filter(product__category_id=category_id)

    # Aggregate sales
    sales_data = (
        queryset
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total_sales=Sum('amount'))
        .order_by('month')
    )

    formatted_data = [
        {
            "month": datetime.strftime(item['month'], "%b %Y"),
            "total_sales": item['total_sales'] or 0
        }
        for item in sales_data
    ]

    return Response(formatted_data)
