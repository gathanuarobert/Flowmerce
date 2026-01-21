from django.contrib import admin

from .models import User, Product, Category, Tag, Order, OrderItem, Profile, SubscriptionGrant, Subscription, Plan, PlanPrice, Feature, FeaturePrice, UserFeatureSubscription, Payment, PaymentRequest

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

@admin.register(SubscriptionGrant)
class SubscriptionGrantAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'plan',
        'duration_days',
        'source',
        'granted_by',
        'start_date',
        'end_date',
    )

    readonly_fields = ('start_date', 'end_date')

admin.site.register(Plan)
admin.site.register(Subscription)
admin.site.register(PlanPrice)
admin.site.register(Feature)
admin.site.register(FeaturePrice)
admin.site.register(UserFeatureSubscription)
admin.site.register(Payment)
admin.site.register(PaymentRequest)

admin.site.site_header = 'Flowmerce Admin'
admin.site.site_title = 'Flowmerce Admin Portal'
admin.site.index_title = 'Welcome to Flowmerce Admin'