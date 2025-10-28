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
            user.set_password(password)  # ✅ Hash the password properly
        user.save()
        return user


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
    product_sku = serializers.CharField(required=False)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'product_price', 'product_sku', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    amount = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = Order
        fields = ['id', 'number', 'employee_email', 'amount', 'status', 'order_date', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user

        # Create the order
        order = Order.objects.create(employee=user, **validated_data)
        print(f"✅ Creating order items for: {order.number}")

        # Create the items
        for item_data in items_data:
            print("➡️ Item data received:", item_data)
            product_field = item_data.get('product')

            if isinstance(product_field, Product):
                product = product_field
            else:
                product = get_object_or_404(Product, id=product_field)

            item = OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.price,
                product_title=product.title,
                product_price=product.price,
                product_sku=product.sku
          )

        print("✅ Created item:", item.id)

        # ✅ Now calculate amount after items exist
        order.amount = sum(item.total_price for item in order.items.all())
        order.save(update_fields=['amount'])
        print(f"💰 Final order amount: {order.amount}")

        print("✅ Finished creating order.")
        return order





class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'        