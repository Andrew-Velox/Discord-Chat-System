from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
import logging

logger = logging.getLogger(__name__)

from .models import Account
from .schemas import user_list_docs
from .serializers import (
    AccountSerializer,
    CustomTokenObtainPairSerializer,
    JWTCookieTokenRefreshSerializer,
    RegisterSerializer,
)


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data["username"]

            forbidden_usernames = ["admin", "root", "superuser"]
            if username is forbidden_usernames:
                return Response({"error": "Username not allowed"}, status=status.HTTP_409_CONFLICT)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        errors = serializer.errors
        if "username" in errors and "non_field_errors" not in errors:
            return Response({"error": "Username already exists"}, status=status.HTTP_409_CONFLICT)

        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


class LogOutAPIView(APIView):
    def post(self, request, format=None):
        response = Response("Logged out successfully")

        # Clear cookies with proper domain and path settings
        cookie_kwargs = {
            "expires": 0,
            "path": "/",
            "httponly": True,
            "samesite": settings.SIMPLE_JWT.get("JWT_COOKIE_SAMESITE", "Lax"),
            "secure": settings.SIMPLE_JWT.get("JWT_COOKIE_SECURE", False),
        }
        
        # Add domain for production
        if hasattr(settings.SIMPLE_JWT, "JWT_COOKIE_DOMAIN") and settings.SIMPLE_JWT.get("JWT_COOKIE_DOMAIN"):
            cookie_kwargs["domain"] = settings.SIMPLE_JWT["JWT_COOKIE_DOMAIN"]

        response.set_cookie(
            settings.SIMPLE_JWT.get("REFRESH_TOKEN_NAME", "refresh_token"), 
            "", 
            **cookie_kwargs
        )
        response.set_cookie(
            settings.SIMPLE_JWT.get("ACCESS_TOKEN_NAME", "access_token"), 
            "", 
            **cookie_kwargs
        )

        return response


class VerifyAuthAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        return Response({
            "authenticated": True,
            "user_id": str(request.user.id),
            "username": request.user.username
        })


class AccountViewSet(viewsets.ViewSet):
    queryset = Account.objects.all()
    permission_classes = [IsAuthenticated]

    @user_list_docs
    def list(self, request):
        user_id = request.query_params.get("user_id")
        queryset = Account.objects.get(id=user_id)
        serializer = AccountSerializer(queryset)
        return Response(serializer.data)


class JWTSetCookieMixin:
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("refresh"):
            cookie_kwargs = {
                "max_age": settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                "httponly": settings.SIMPLE_JWT["JWT_COOKIE_HTTPONLY"],
                "samesite": settings.SIMPLE_JWT["JWT_COOKIE_SAMESITE"],
                "secure": settings.SIMPLE_JWT["JWT_COOKIE_SECURE"],
                "path": "/",  # Ensure cookie is available for all paths
            }
            
            # Add domain for production
            if hasattr(settings.SIMPLE_JWT, "JWT_COOKIE_DOMAIN") and settings.SIMPLE_JWT["JWT_COOKIE_DOMAIN"]:
                cookie_kwargs["domain"] = settings.SIMPLE_JWT["JWT_COOKIE_DOMAIN"]
                
            response.set_cookie(
                settings.SIMPLE_JWT["REFRESH_TOKEN_NAME"],
                response.data["refresh"],
                **cookie_kwargs
            )
            
        if response.data.get("access"):
            cookie_kwargs = {
                "max_age": settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                "httponly": settings.SIMPLE_JWT["JWT_COOKIE_HTTPONLY"],
                "samesite": settings.SIMPLE_JWT["JWT_COOKIE_SAMESITE"],
                "secure": settings.SIMPLE_JWT["JWT_COOKIE_SECURE"],
                "path": "/",  # Ensure cookie is available for all paths
            }
            
            # Add domain for production
            if hasattr(settings.SIMPLE_JWT, "JWT_COOKIE_DOMAIN") and settings.SIMPLE_JWT["JWT_COOKIE_DOMAIN"]:
                cookie_kwargs["domain"] = settings.SIMPLE_JWT["JWT_COOKIE_DOMAIN"]
                
            response.set_cookie(
                settings.SIMPLE_JWT["ACCESS_TOKEN_NAME"],
                response.data["access"],
                **cookie_kwargs
            )
            del response.data["access"]

        return super().finalize_response(request, response, *args, **kwargs)


class JWTCookieTokenObtainPairView(JWTSetCookieMixin, TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class JWTCookieTokenRefreshView(JWTSetCookieMixin, TokenRefreshView):
    serializer_class = JWTCookieTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        logger.info(f"Token refresh request - Cookies: {request.COOKIES}")
        logger.info(f"Token refresh request - Headers: {dict(request.headers)}")
        logger.info(f"Token refresh request - Data: {request.data}")
        
        try:
            response = super().post(request, *args, **kwargs)
            logger.info(f"Token refresh response status: {response.status_code}")
            return response
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            raise
