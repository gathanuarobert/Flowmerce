from django.db.models import Q
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class EmailBackend(ModelBackend):
    class EmailBackend(ModelBackend):
        def authenticate(self, request, email=None, password=None, **kwargs):
            try:
                user = User.objects.get(email__iexact=email)  # Only check email
                if user.check_password(password):
                    return user
            except User.DoesNotExist:
                return None