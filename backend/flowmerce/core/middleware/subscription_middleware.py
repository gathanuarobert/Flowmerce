from django.http import JsonResponse
from django.utils import timezone
from django.urls import resolve

from core.models import Subscription


WHITELISTED_URL_NAMES = [
    'login',
    'register',
    'payment-initiate',
    'payment-callback',
]


class SubscriptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip unauthenticated users
        if not request.user.is_authenticated:
            return self.get_response(request)

        # 🔑 Admin / staff bypass
        if request.user.is_superuser or request.user.is_staff:
            return self.get_response(request)

        # Skip whitelisted routes
        try:
            resolved = resolve(request.path)
            if resolved.url_name in WHITELISTED_URL_NAMES:
                return self.get_response(request)
        except Exception:
            pass

        # Check subscription exists
        try:
            subscription = request.user.subscription
        except Subscription.DoesNotExist:
            return self._blocked_response(
                "No active subscription. Please subscribe to continue."
            )

        # Manual block (fraud / admin)
        if subscription.is_blocked:
            return self._blocked_response(
                "Your account has been blocked. Contact support."
            )

        # 🔑 Check active status
        if not subscription.is_active():
            subscription.status = Subscription.EXPIRED
            subscription.save(update_fields=['status'])
            return self._blocked_response(
                "Your subscription has expired. Please renew."
            )

        now = timezone.now()
        days_remaining = subscription.days_remaining()

        # Last 5 days warning
        if days_remaining <= 5:
            if subscription.status != Subscription.EXPIRING:
                subscription.status = Subscription.EXPIRING
                subscription.save(update_fields=['status'])

            # Attach info for frontend
            request.subscription_warning = True
            request.days_remaining = days_remaining
        else:
            request.subscription_warning = False

        # Attach subscription globally (useful)
        request.subscription = subscription

        return self.get_response(request)

    def _blocked_response(self, message):
        return JsonResponse(
            {
                "detail": message,
                "code": "SUBSCRIPTION_REQUIRED"
            },
            status=402
        )
