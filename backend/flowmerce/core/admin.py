from django.contrib import admin

from .models import User, Product, Category, Tag

admin.site.register(User)

@admin.site.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('image', 'title', 'category', 'status', 'stock', 'price')
    list_filter = ('category', 'status')
    search_fields = ('title', 'category')

admin.site.register(Category)
admin.site.register(Tag)

admin.site.site_header = 'Flowmerce Admin'
admin.site.site_title = 'Flowmerce Admin Portal'
admin.site.index_title = 'Welcome to Flowmerce Admin'