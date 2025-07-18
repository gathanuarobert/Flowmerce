from django.contrib.auth.models import UserManager, AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

class CustomUserManager(UserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
    
    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)

    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name or self.email.split('@')[0]

    def __str__(self):
        return self.email
    

class Category(models.Model):   
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title

class Product(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField()
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    quantity = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=255, unique=True)
    tags = models.ManyToManyField('Tag', related_name='products', blank=True)
    status = models.CharField(max_length=255, choices=[('available', 'Available'), ('out_of_stock', 'Out of Stock')], default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)     

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class Tag(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title


class Order(models.Model):
    employee = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    number = models.IntegerField(null=True, blank= True, unique=True, help_text="Human-readable order number")
    amount = models.PositiveIntegerField(default=0)
    PENDING = 'Pending'
    COMPLETED = 'Completed'
    CANCELLED = 'Cancelled'
    STATUS_CHOICES = [(PENDING, 'Pending'), (COMPLETED, 'Completed'), (CANCELLED, 'Cancelled')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=COMPLETED,)
    order_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name ='Order'
        verbose_name_plural = 'Orders'
        
    def __str__(self):
        return f'Order {self.id} by {self.employee.email}'
    
    @property
    def employee_email(self):
        return self.employee.email
    
    def save(self, *args, **kwargs):
        if not self.number:
            last_order = Order.objects.order_by('-number').first()
        self.number = (last_order.number + 1) if last_order and last_order.number else 1000
        super().save(*args, **kwargs)
# Now calculate total amount after order is saved
        self.amount = sum(item.total_price for item in self.items.all())
        super().save(update_fields=['amount'])


  
               
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    price = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.title} x {self.quantity}"

    @property
    def total_price(self):
        return self.quantity * self.price        
    

class Profile(models.Model):
    id = models.BigAutoField(primary_key=True)  # Explicit auto-increment
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile',
        db_column='user_id'  # Explicit column name
    )
    profile_picture = models.ImageField(upload_to='profiles/', blank=True)

    class Meta:
        db_table = 'profiles'  # Explicit table name

    def __str__(self):
        return f"{self.user.email}'s profile"