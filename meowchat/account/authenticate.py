from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try to get token from cookie first
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT["ACCESS_TOKEN_NAME"]) or None
        
        # If no token in cookie, try Authorization header as fallback
        if raw_token is None:
            header = self.get_header(request)
            if header is not None:
                raw_token = self.get_raw_token(header)
        
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except TokenError:
            return None
