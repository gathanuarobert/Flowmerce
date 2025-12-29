from django.contrib import admin

from .models import User, Product, Category, Tag, Order, OrderItem, Profile

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
    list_display = ('id', 'employee', 'status', 'amount')
    list_filter = ('status', 'employee')
    search_fields = ('employee__email',)

admin.site.register(OrderItem) 

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile_picture')

admin.site.site_header = 'Flowmerce Admin'
admin.site.site_title = 'Flowmerce Admin Portal'
admin.site.index_title = 'Welcome to Flowmerce Admin'