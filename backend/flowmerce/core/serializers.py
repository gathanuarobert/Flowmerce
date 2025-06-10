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

class Orderserializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    employee = serializers.CharField(source='employee.email', read_only=True)    
    class Meta:
        model = Order
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product_title', read_only=True)     
    class Meta:
        model = OrderItem
        field = '__all__'   