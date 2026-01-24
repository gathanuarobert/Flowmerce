from django.contrib.auth.models import UserManager, AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from datetime import timedelta

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

    def __str__(self):
        return self.email
    

class Category(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title

class Product(models.Model):
    owner = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name='products',
    null=True,
    blank=True
)


    title = models.CharField(max_length=255)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField()

    category = models.ForeignKey(
        Category,
        related_name='products',
        on_delete=models.CASCADE
    )

    image = models.ImageField(upload_to='products/', blank=True, null=True)
    quantity = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)

    sku = models.CharField(max_length=255)

    tags = models.ManyToManyField(
        'Tag',
        related_name='products',
        blank=True
    )

    status = models.CharField(
        max_length=255,
        choices=[('available', 'Available'), ('out_of_stock', 'Out of Stock')],
        default='available'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        unique_together = ('owner', 'sku')  # 🔥 SaaS-safe SKU

    def __str__(self):
        return f"{self.title} ({self.owner.email if self.owner else 'No Owner'})"

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
    employee = models.ForeignKey(
        User,
        related_name='orders',
        on_delete=models.CASCADE
    )

    number = models.IntegerField(
        null=True,
        blank=True,
        unique=True,
        help_text="Human-readable order number"
    )

    amount = models.PositiveIntegerField(default=0)

    PENDING = 'Pending'
    COMPLETED = 'Completed'
    CANCELLED = 'Cancelled'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled')
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=COMPLETED
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'

    def __str__(self):
        return f"Order {self.number} ({self.employee.email})"

    def save(self, *args, **kwargs):
        if not self.number:
            last_order = Order.objects.order_by('-number').first()
            self.number = (last_order.number + 1) if last_order and last_order.number else 1000
        super().save(*args, **kwargs)


  
               
    
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name='items',
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        related_name='order_items',
        on_delete=models.CASCADE
    )

    # Snapshotted product details
    product_title = models.CharField(max_length=255, blank=True)
    product_price = models.PositiveIntegerField(default=0)
    product_sku = models.CharField(max_length=255, blank=True)

    quantity = models.PositiveIntegerField(default=0)
    price = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product_title} x {self.quantity}"

    @property
    def total_price(self):
        return self.quantity * self.price
     
    

class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    profile_picture = models.ImageField(upload_to='profiles/', blank=True)

    country = models.CharField(
        max_length=2,
        default='KE',
        help_text="ISO country code e.g KE, US, NG"
    )

    currency = models.CharField(
        max_length=3,
        default='KES',
        help_text="ISO currency code e.g KES, USD"
    )

    def __str__(self):
        return f"{self.user.email} ({self.country})"


class Plan(models.Model):
    code = models.CharField(max_length=50, unique=True)  # basic, pro
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class PlanPrice(models.Model):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)

    country = models.CharField(max_length=2)
    currency = models.CharField(max_length=3)

    monthly_price = models.PositiveIntegerField()

    class Meta:
        unique_together = ('plan', 'country')

    def __str__(self):
        return f"{self.plan.code} - {self.country}"


class Subscription(models.Model):
    ACTIVE = 'active'
    EXPIRING = 'expiring'
    EXPIRED = 'expired'
    CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('rejected', 'Rejected'),

    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='subscription'
    )

    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    mpesa_code = models.CharField(max_length=50, blank=True, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    duration_days = models.IntegerField(default=30)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    auto_renew = models.BooleanField(default=True)
    is_blocked = models.BooleanField(default=False)

    granted_by_admin = models.BooleanField(default=False)
    grant_reason = models.CharField(max_length=255, blank=True)

    # 🔑 IMPORTANT (was missing before)
    last_notified_at = models.DateTimeField(null=True, blank=True)

    
    
    def is_active(self):
        return self.status == self.ACTIVE and self.end_date and self.end_date > timezone.now()

    def activate(self):
        self.status = 'active'
        self.start_date = timezone.now()
        self.end_date = self.start_date + timedelta(days=self.duration_days)
        self.save()

    def days_remaining(self):
        return max((self.end_date - timezone.now()).days, 0)

    def __str__(self):
        return f"{self.user.email} - {self.status}"


class Feature(models.Model):
    code = models.CharField(max_length=50, unique=True)  # ai_assistant
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class FeaturePrice(models.Model):
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE)

    country = models.CharField(max_length=2)
    currency = models.CharField(max_length=3)

    monthly_price = models.PositiveIntegerField()

    class Meta:
        unique_together = ('feature', 'country')


class UserFeatureSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'feature')


class Payment(models.Model):
    SUCCESS = 'success'
    FAILED = 'failed'
    PENDING = 'pending'

    STATUS_CHOICES = [
        (SUCCESS, 'Success'),
        (FAILED, 'Failed'),
        (PENDING, 'Pending'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments'
    )

    amount = models.PositiveIntegerField()
    currency = models.CharField(max_length=3)

    provider = models.CharField(max_length=50)  # mpesa, stripe
    reference = models.CharField(max_length=255, unique=True)
    purpose = models.CharField(
        max_length=50,
        help_text="subscription, ai_feature"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)


class SubscriptionGrant(models.Model):
    ADMIN = 'admin'
    MPESA = 'mpesa'
    STRIPE = 'stripe'

    SOURCE_CHOICES = [
        (ADMIN, 'Admin Grant'),
        (MPESA, 'Mpesa'),
        (STRIPE, 'Stripe'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='subscription_grants'
    )

    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT
    )

    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='granted_subscriptions'
    )

    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default=ADMIN
    )

    duration_days = models.PositiveIntegerField(help_text="Number of days granted")

    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan.code} ({self.duration_days} days)"
    
    def save(self, *args, **kwargs):
        creating = self.pk is None

        if not self.end_date:
            self.end_date = self.start_date + timezone.timedelta(days=self.duration_days)

        super().save(*args, **kwargs)

        if creating:
            Subscription.objects.update_or_create(
                user=self.user,
            defaults={
                'plan': self.plan,
                'start_date': self.start_date,
                'end_date': self.end_date,
                'status': Subscription.ACTIVE,
                'is_blocked': False,
            }
        )




class PaymentRequest(models.Model):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payment_requests'
    )

    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)

    amount = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default='KES')

    mpesa_reference = models.CharField(
        max_length=20,
        help_text="Mpesa transaction code"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )

    reviewed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_payments'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.amount} ({self.status})"
    
    def approve(self, admin_user):
        if self.status != self.PENDING:
            return

        self.status = self.APPROVED
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])

        SubscriptionGrant.objects.create(
            user=self.user,
            plan=self.plan,
            duration_days=30,
            source=SubscriptionGrant.ADMIN,
            granted_by=admin_user
        )

    def reject(self, admin_user):
        self.status = self.REJECTED
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])
