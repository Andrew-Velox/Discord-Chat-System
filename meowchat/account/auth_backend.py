from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class CustomAuthBackend(BaseBackend):
    """
    Simple, reliable authentication backend that works with Django sessions.
    No JWT complexity - just clean session-based auth.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                logger.info(f"Authentication successful for user: {username}")
                return user
            else:
                logger.warning(f"Invalid password for user: {username}")
        except User.DoesNotExist:
            logger.warning(f"User not found: {username}")
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None