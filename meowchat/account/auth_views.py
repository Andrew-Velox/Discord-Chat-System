from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import IntegrityError
import json
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    """
    Simple login endpoint using Django sessions.
    Works reliably with HTTPS cookies.
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Log user in (creates session)
            login(request, user)
            
            logger.info(f"User {username} logged in successfully")
            
            return Response({
                'message': 'Login successful',
                'user_id': str(user.id),
                'username': user.username
            }, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Login failed for username: {username}")
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except json.JSONDecodeError:
        return Response({
            'error': 'Invalid JSON'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
def custom_logout(request):
    """
    Simple logout endpoint.
    Clears Django session.
    """
    if request.user.is_authenticated:
        username = request.user.username
        logout(request)
        logger.info(f"User {username} logged out successfully")
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'message': 'Not logged in'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_auth(request):
    """
    Verify if user is authenticated.
    Returns user info if authenticated.
    """
    return Response({
        'authenticated': True,
        'user_id': str(request.user.id),
        'username': request.user.username
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_register(request):
    """
    Simple registration endpoint.
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create_user(username=username, password=password)
        
        logger.info(f"User {username} registered successfully")
        
        return Response({
            'message': 'Registration successful',
            'user_id': str(user.id),
            'username': user.username
        }, status=status.HTTP_201_CREATED)
        
    except json.JSONDecodeError:
        return Response({
            'error': 'Invalid JSON'
        }, status=status.HTTP_400_BAD_REQUEST)
    except IntegrityError:
        return Response({
            'error': 'Username already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)