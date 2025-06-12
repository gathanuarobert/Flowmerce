from django.db.models.signals import post_save, pre_save
from django.utils.text import slugify
from django.dispatch import receiver
from .models import User, Order, Product

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        print(f'Profile created for user:{instance.email}')
        instance.profile.save()

@receiver(post_save, sender=Product)
def create_new_product(sender, instance, created, **kwargs):
    if created:
        print(f'New product added: {instance.title}')
        instance.save()        

@receiver(post_save, sender=Order)
def product_stock_update(sender, instance, created, **kwargs):
    if created:
        product = instance.product
        product.stock -= instance.quantity
        if product.stock <= 0:
            product.status = 'out of stock'
        product.save()  

@receiver(pre_save, sender=Product)
def set_product_slug(sender, instance, **kwargs):
    if not instance.slug:
        instance.slug = slugify(instance.title)