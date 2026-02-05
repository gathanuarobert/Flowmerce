from rest_framework import permissions

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