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
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True
    )
    category_details = CategorySerializer(source='category', read_only=True)
    tags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'quantity', 'stock',
            'sku', 'image', 'status', 'category', 'category_details',
            'tags', 'slug', 'created_at', 'updated_at'  # Add other fields if applicable
        ]
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
    # If needed, include read-only product details for responses
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'product_price', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    amount = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = Order
        fields = ['id', 'employee_email', 'amount', 'status', 'order_date', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user  # make sure 'request' is passed to serializer context
        order = Order.objects.create(employee=user, **validated_data)

        for item_data in items_data:
            # Ensure mandatory fields exist in item_data: product, quantity, price
            OrderItem.objects.create(order=order, **item_data)

        return order

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'        