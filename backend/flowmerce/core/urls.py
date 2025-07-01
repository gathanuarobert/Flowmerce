from django.urls import path, include  # Add include to the imports
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import (
    UserListView,
    UserRegisterView,
    UserLoginAPIView,
    UserLogoutView,
    ProductListView,
    ProductCreateView,
    ProductDetailView,
    OrderListView,
    OrderDetailView,
    OrderCreateView,
    CategoryViewSet,
    TagViewSet
)

# Create a single router
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/register/', UserRegisterView.as_view(), name='user-register'),
    path('api/login/', UserLoginAPIView.as_view(), name='user-login'),
    path('api/logout/', UserLogoutView.as_view(), name='user-logout'),
    path('api/products/', ProductListView.as_view(), name='product-list'),
    path('api/products/create/', ProductCreateView.as_view(), name='product-create'),
    path('api/products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('api/orders/', OrderListView.as_view(), name='order-list'),
    path('api/orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('api/orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    
    # Include the router URLs under the api/ prefix
    path('api/', include(router.urls)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)