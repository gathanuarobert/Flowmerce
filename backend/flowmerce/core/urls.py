from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    UserListView,
    UserRegisterView,
    UserLoginAPIVIEW,
    UserLogoutView,
    ProductListView,
    ProductCreateView,
    ProductDetailView,
    OrderListView,
    OrderDetailView,
    OrderCreateView,
)

