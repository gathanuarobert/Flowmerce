from django.contrib import admin

from .models import User, Product, Category, Tag, Order, OrderItem

admin.site.register(User)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('image', 'title', 'category', 'status', 'stock', 'price')
    list_filter = ('category', 'status')
    search_fields = ('title', 'category')

admin.site.register(Category)
admin.site.register(Tag)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('employee', 'product_title', 'quantity', 'status', 'amount', 'order_date')
    list_filter = ('order_date', 'status', 'product__title')
    search_fields = ('product__title', 'order_date', 'employee')

admin.site.register(OrderItem)    

admin.site.site_header = 'Flowmerce Admin'
admin.site.site_title = 'Flowmerce Admin Portal'
admin.site.index_title = 'Welcome to Flowmerce Admin'