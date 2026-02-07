from rest_framework import permissions
from rest_framework.permissions import BasePermission

class IsAdminUser(permissions.BasePermission):
    """
    Only allow access to superuser or staff users.
    """

    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admins can do anything. Non-admins can only read (GET, HEAD, OPTIONS)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))


class HasActiveSubscription(permissions.BasePermission):
    """
    Allow access only to users with an active subscription or admins.
    """

    def has_permission(self, request, view):
        if request.user.is_staff or request.user.is_superuser:
            return True
        try:
            return request.user.subscription.is_active()
        except Exception:
            return False

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )
    
class CanUseAI(BasePermission):
    message = "Upgrade your plan to use the AI assistant."

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        if user.is_staff or user.is_superuser:
            return True

        try:
            sub = user.subscription
        except:
            return False

        if not sub.is_active():
            return False

        plan_code = sub.plan.code.lower()

        # BASIC → no AI
        if plan_code == "basic":
            return False

        # PREMIUM → unlimited
        if plan_code == "premium":
            return True

        # PRO → limited usage
        if plan_code == "pro":
            return sub.ai_requests_used < sub.ai_request_limit

        return False