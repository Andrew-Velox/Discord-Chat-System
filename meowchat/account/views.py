from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__name__)

from .models import Account
from .schemas import user_list_docs
from .serializers import (
    AccountSerializer,
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
        # Use Django's built-in session logout
        from django.contrib.auth import logout
        logout(request)
        
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        
        # Clear session cookie explicitly (belt and suspenders approach)
        response.delete_cookie(
            'sessionid',
            path='/',
            domain=None,  # Let browser handle domain
            samesite='None' if not settings.DEBUG else 'Lax'
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
