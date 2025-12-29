from rest_framework import serializers
from django.shortcuts import get_object_or_404
from .models import User, Product, Order, OrderItem, Category, Tag

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'is_active', 'last_login']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = self.Meta.model(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)  # Added: show product owner
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
            'sku', 'image', 'status', 'owner', 'category', 'category_details',
            'tags', 'slug', 'created_at', 'updated_at'
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
    product_title = serializers.CharField(required=False)
    product_price = serializers.DecimalField(required=False, max_digits=10, decimal_places=2)
    product_sku = serializers.CharField(required=False)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_title',
            'product_price',
            'product_sku',
            'quantity',
            'price',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    amount = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = Order
        fields = ['id', 'number', 'employee_email', 'amount', 'status', 'created_at', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user

        # Create the order
        order = Order.objects.create(employee=user, **validated_data)

        # Create the items
        for item_data in items_data:
            product_field = item_data.get('product')
            product = product_field if isinstance(product_field, Product) else get_object_or_404(Product, id=product_field)

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.price,
                product_title=product.title,
                product_price=product.price,
                product_sku=product.sku,
            )

        # Calculate total order amount
        order.amount = sum(item.total_price for item in order.items.all())
        order.save(update_fields=['amount'])

        return order


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'
