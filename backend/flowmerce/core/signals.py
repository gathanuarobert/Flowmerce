from django.db.models.signals import post_save, pre_save
from django.utils.text import slugify
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Order, Product, Profile, OrderItem


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
    elif hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(post_save, sender=Product)
def create_new_product(sender, instance, created, **kwargs):
    if created:
        print(f'New product added: {instance.title}')
        instance.save()


@receiver(post_save, sender=OrderItem)
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
        # Collect product titles from related OrderItems
        items = instance.items.all()
        product_titles = ", ".join([item.product.title for item in items]) or "No products"

        print(
            f'🧾 New order created: {instance.number} by {instance.employee.email}. '
            f'Products: {product_titles}'
        )

        # Send confirmation email
        order_confirmation_email(instance)


def order_confirmation_email(order):
    items = order.items.all()
    product_titles = ", ".join([item.product.title for item in items]) or "No products"

    subject = f'Internal Order Confirmation: {order.number}'
    message = (
        f'An internal order has been successfully recorded.\n\n'
        f'Order Number: {order.number}\n'
        f'Products: {product_titles}\n\n'
        f'Thank you for processing this order internally.'
    )
    recipient = order.employee.email

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
    )
