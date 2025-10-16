from django.urls import path, include  # Add include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import (
    UserListView,
    UserRegisterView,
    UserLoginAPIView,
    UserLogoutView,
    ProductViewSet,
    OrderViewSet,
    CategoryViewSet,
    TagViewSet,
    analytics_summary,
    monthly_sales,
    show_all_urls  # Add this
)
from .views_ai import FlowmerceAssistantView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('assistant/', FlowmerceAssistantView.as_view(), name='flowmerce-assistant'),
    path('analytics/summary/', analytics_summary, name='analytics-summary'),
    path('analytics/monthly-sales/', monthly_sales, name='monthly-sales'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', UserRegisterView.as_view(), name='user-register'),
    path('login/', UserLoginAPIView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    # path('orders/', OrderListView.as_view(), name='order-list'),
    # path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    # path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('debug/urls/', show_all_urls, name='debug-urls'),  # Add name for reference
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Only include router.urls once (choose one method)
urlpatterns += router.urls