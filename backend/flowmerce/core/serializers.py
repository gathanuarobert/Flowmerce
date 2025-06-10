from rest_framework import serializers
from .models import User, Product, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'is_active', 'last_login']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'    

class OrderSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    employee = serializers.CharField(source='employee.email', read_only=True)
    product_price = serializers.IntegerField(source='product.price', read_only=True)
    quantity = serializers.IntegerField(default=1)
    amount = serializers.IntegerField(read_only=True)
    order_date = serializers.DateTimeField(read_only=True)
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES, default='pending')
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.IntegerField(source='product.price', read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'   