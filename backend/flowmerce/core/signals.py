from django.db.models.signals import post_save, pre_save
from django.utils.text import slugify
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
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

@receiver(post_save, sender=Order)
def new_order(sender, instance, created, **kwargs):
    if created:
        print(f'New order created: {instance.number} for product {instance.product.title} by {instance.employee.email}')  

def order_confirmation_email(order):
    subject = f'Order Confirmation: {order.number}'
    message = (
        f'Your order for {order.product.title} has been placed successfully.\n'
        f'Order Number: {order.number}\n'
        f'Product: {order.product.title}'
        )           
    recipient = order.employee.email
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )