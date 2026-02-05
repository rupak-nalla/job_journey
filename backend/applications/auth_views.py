import logging
import sys
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError

logger = logging.getLogger('applications')  # Use the 'applications' logger from settings
User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    try:
        # Log request for debugging (will show in Render logs)
        logger.info(f"[REGISTER] Request received. Method: {request.method}, Content-Type: {request.content_type}")
        logger.info(f"[REGISTER] Request data: {request.data}")
        sys.stdout.flush()  # Ensure logs are flushed immediately
        
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        # Validation
        if not username or not email or not password:
            error_msg = 'Username, email, and password are required'
            logger.warning(f"[REGISTER] Error: {error_msg}")
            sys.stdout.flush()
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate password using Django's validators
        # Create unsaved User instance to enable similarity checks
        unsaved_user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        try:
            validate_password(password, user=unsaved_user)
        except DjangoValidationError as e:
            error_msg = 'Password validation failed: ' + ' '.join(e.messages)
            logger.warning(f"[REGISTER] Error: {error_msg}")
            sys.stdout.flush()
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            error_msg = f'Username "{username}" already exists'
            logger.warning(f"[REGISTER] Error: {error_msg}")
            sys.stdout.flush()
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            error_msg = f'Email "{email}" already exists'
            logger.warning(f"[REGISTER] Error: {error_msg}")
            sys.stdout.flush()
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        logger.info(f"[REGISTER] Success: User {username} created with ID {user.id}")
        sys.stdout.flush()
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    except IntegrityError as e:
        error_msg = 'User already exists (database constraint violation)'
        logger.exception(f"[REGISTER] IntegrityError: {error_msg} - {str(e)}")
        sys.stdout.flush()
        return Response(
            {'error': error_msg},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        error_msg = f'An error occurred processing your request: {str(e)}'
        logger.exception(f"[REGISTER] Exception: {error_msg}")
        sys.stdout.flush()
        return Response(
            {'error': 'An error occurred processing your request. Please check server logs.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return JWT tokens"""
    try:
        # Log request for debugging (will show in Render logs)
        logger.info(f"[LOGIN] Request received. Method: {request.method}, Content-Type: {request.content_type}")
        logger.info(f"[LOGIN] Request data keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'No data'}")
        sys.stdout.flush()
        
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            error_msg = 'Username and password are required'
            logger.warning(f"[LOGIN] Error: {error_msg}")
            sys.stdout.flush()
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user
        user = authenticate(username=username, password=password)

        if user is None:
            error_msg = f'Invalid username or password for user: {username}'
            logger.warning(f"[LOGIN] Error: {error_msg}")
            sys.stdout.flush()
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            error_msg = f'User account is disabled: {username}'
            logger.warning(f"[LOGIN] Error: {error_msg}")
            sys.stdout.flush()
            return Response(
                {'error': 'User account is disabled'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        logger.info(f"[LOGIN] Success: User {username} logged in with ID {user.id}")
        sys.stdout.flush()

        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        error_msg = f'An error occurred during login: {str(e)}'
        logger.exception(f"[LOGIN] Exception: {error_msg}")
        sys.stdout.flush()
        return Response(
            {'error': 'An error occurred. Please check server logs.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user by blacklisting refresh token"""
    try:
        refresh_token = request.data.get('refresh_token')
        
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
    except Exception:
        logger.exception('Error during user logout')
        return Response(
            {'error': 'An error occurred'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    """Get current user information"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'date_joined': user.date_joined,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh access token using refresh token"""
    refresh_token_value = request.data.get('refresh_token')
    
    if not refresh_token_value:
        return Response(
            {'error': 'Refresh token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Use TokenRefreshSerializer to handle rotation and blacklist
    try:
        serializer = TokenRefreshSerializer(data={'refresh': refresh_token_value})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    except TokenError as e:
        # Handle token errors (invalid/expired token)
        logger.warning(f"Token refresh failed: {str(e)}")
        return Response(
            {'error': 'Token is invalid or expired'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except ValidationError as e:
        # Handle other validation errors
        logger.warning(f"Token refresh validation failed: {str(e)}")
        return Response(
            {'error': 'Token is invalid or expired'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception:
        logger.exception('Error during token refresh')
        return Response(
            {'error': 'An error occurred during token refresh'},
            status=status.HTTP_400_BAD_REQUEST
        )
