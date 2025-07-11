from rest_framework import serializers
from .models import User, Product, Order, OrderItem, Category, Tag

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'is_active', 'last_login']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), required=False)

    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'slug': {'required': False}
        }

    def validate_price(self, value):
        try:
            return float(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError("Price must be a number")


class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    quantity = serializers.IntegerField(default=1)
    price = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    class Meta:
        model = OrderItem
        fields = ['id', 'order_id', 'product', 'product_title', 'product_price', 'product_image', 'quantity', 'price']
        extra_kwargs = {
            'product': {'write_only': True}
        }  

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    amount = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES, default='pending')

    class Meta:
        model = Order
        fields = ['id','employee', 'employee_email', 'amount', 'status', 'items']
        extra_kwargs = {
            'employee': {'write_only': True}
        }

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'        