from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Avg, Count
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework import parsers, generics
import logging
from django.shortcuts import get_object_or_404
import requests
from django.conf import settings
from django.db.models.functions import TruncMonth
from datetime import datetime
logger = logging.getLogger(__name__)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils.text import slugify
from .models import User, Product, Order, OrderItem, Category, Tag
from .serializers import UserSerializer, ProductSerializer, OrderSerializer, OrderItemSerializer, CategorySerializer, TagSerializer

def verify_recaptcha(token):
    """Verify Google reCAPTCHA v2 token with Google's API."""
    data = {
        'secret': settings.RECAPTCHA_SECRET_KEY,
        'response': token,
    }
    try:
        response = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)
        result = response.json()
        return result.get('success', False)
    except Exception as e:
        logger.error(f"reCAPTCHA verification failed: {e}")
        return False


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)    

class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = CustomPagination
    
class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        recaptcha_token = request.data.get('g-recaptcha-response')

        if not recaptcha_token or not verify_recaptcha(recaptcha_token):
            return Response(
                {'error': 'Invalid reCAPTCHA. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # ✅ password now hashed via serializer.create()
            token = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
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
    


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Only allow owners of a product to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions only for the owner
        return obj.owner == request.user


class ProductViewSet(viewsets.ModelViewSet):
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    serializer_class = ProductSerializer
    pagination_class = CustomPagination
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Only return products owned by the logged-in user
        return Product.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the owner to the logged-in user
        serializer.save(owner=self.request.user)
   


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        # Only show orders belonging to the logged-in user
        return Order.objects.filter(employee=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        # Automatically set employee to the logged-in user
        serializer.save(employee=self.request.user)



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
    total_orders = Order.objects.filter(employee=request.user).count()
    total_revenue = Order.objects.filter(employee=request.user).aggregate(total=Sum('amount'))['total'] or 0
    avg_order_value = Order.objects.filter(employee=request.user).aggregate(avg=Avg('amount'))['avg'] or 0
    total_products = Product.objects.filter(owner=request.user).count()

    top_products = (
        OrderItem.objects.filter(order__employee=request.user)
        .values('product__title')
        .annotate(total_sold=Sum('quantity'))
        .order_by('-total_sold')[:5]
    )

    status_counts = (
        Order.objects.filter(employee=request.user)
        .values('status')
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
    year = request.GET.get('year')
    queryset = Order.objects.filter(employee=request.user)

    if year:
        queryset = queryset.filter(created_at__year=year)

    sales_data = (
        queryset
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(
            total_revenue=Sum('amount'),
            total_orders=Count('id'),
        )
        .order_by('month')
    )

    formatted_data = {
        "months": [],
        "total_revenue": [],
        "total_orders": [],
    }

    for item in sales_data:
        formatted_data["months"].append(item["month"].strftime("%b %Y"))
        formatted_data["total_revenue"].append(float(item["total_revenue"] or 0))
        formatted_data["total_orders"].append(item["total_orders"])

    return Response(formatted_data)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def order_items_handler(request, order_id):
    order = get_object_or_404(Order, id=order_id, employee=request.user)

    if request.method == "DELETE":
        deleted_count, _ = OrderItem.objects.filter(order=order).delete()
        order.amount = 0
        order.save(update_fields=["amount"])
        return Response(
            {"detail": f"{deleted_count} items deleted"},
            status=status.HTTP_204_NO_CONTENT
        )

    if request.method == "POST":
        serializer = OrderItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]

        item = serializer.save(
            order=order,
            price=product.price,
            product_title=product.title,
            product_price=product.price,
            product_sku=product.sku,
        )

        order.amount = sum(i.total_price for i in order.items.all())
        order.save(update_fields=["amount"])

        return Response(
            OrderItemSerializer(item).data,
            status=status.HTTP_201_CREATED
        )


