from django.db.models.signals import post_save
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

