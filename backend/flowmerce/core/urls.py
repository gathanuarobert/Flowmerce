from django.urls import path
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
)

route = DefaultRouter()

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('login/', UserLoginAPIView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/create/', ProductCreateView.as_view(), name='product-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]

urlpatterns += route.urls
