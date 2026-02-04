"""
Tests for authentication API views
"""
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from django.conf import settings
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import json


class AuthViewsTestCase(TestCase):
    """Test cases for authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.get_user_url = reverse('get_user')
        self.refresh_token_url = reverse('refresh_token')
        
        # Create a test user
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    # ─── Registration Tests ───
    
    def test_register_success(self):
        """Test successful user registration"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        
        # Verify user was created
        self.assertTrue(User.objects.filter(username='newuser').exists())
    
    def test_register_missing_fields(self):
        """Test registration with missing required fields"""
        data = {
            'username': 'newuser',
            # Missing email and password
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_register_short_password(self):
        """Test registration with password shorter than 8 characters"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'short'  # Less than 8 characters
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('8 characters', response.data['error'])
    
    def test_register_duplicate_username(self):
        """Test registration with duplicate username"""
        data = {
            'username': 'testuser',  # Already exists
            'email': 'different@example.com',
            'password': 'newpass123'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('already exists', response.data['error'].lower())
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        data = {
            'username': 'differentuser',
            'email': 'test@example.com',  # Already exists
            'password': 'newpass123'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('already exists', response.data['error'].lower())
    
    def test_register_optional_fields(self):
        """Test registration with optional first_name and last_name"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['first_name'], 'John')
        self.assertEqual(response.data['user']['last_name'], 'Doe')
    
    # ─── Login Tests ───
    
    def test_login_success(self):
        """Test successful login"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
    
    def test_login_missing_credentials(self):
        """Test login with missing username or password"""
        data = {
            'username': 'testuser',
            # Missing password
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_login_invalid_username(self):
        """Test login with invalid username"""
        data = {
            'username': 'nonexistent',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertIn('Invalid', response.data['error'])
    
    def test_login_invalid_password(self):
        """Test login with invalid password"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertIn('Invalid', response.data['error'])
    
    def test_login_inactive_user(self):
        """Test login with inactive user account"""
        self.test_user.is_active = False
        self.test_user.save()
        
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        # Django's authenticate() returns None for inactive users, so we get "Invalid username or password"
        # The check for is_active happens after authenticate, but authenticate itself fails first
        self.assertIn('invalid', response.data['error'].lower())
    
    # ─── Get User Tests ───
    
    def test_get_user_success(self):
        """Test getting current user information"""
        # Authenticate the client
        refresh = RefreshToken.for_user(self.test_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get(self.get_user_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
        self.assertIn('id', response.data)
        self.assertIn('date_joined', response.data)
    
    def test_get_user_unauthorized(self):
        """Test getting user information without authentication"""
        response = self.client.get(self.get_user_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    # ─── Logout Tests ───
    
    def test_logout_success(self):
        """Test successful logout"""
        # Authenticate the client
        refresh = RefreshToken.for_user(self.test_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'refresh_token': str(refresh)
        }
        response = self.client.post(self.logout_url, data, format='json')
        
        # Check if token blacklisting is enabled
        blacklist_enabled = (
            'rest_framework_simplejwt.token_blacklist' in settings.INSTALLED_APPS and
            getattr(settings, 'SIMPLE_JWT', {}).get('BLACKLIST_AFTER_ROTATION', False)
        )
        
        if blacklist_enabled:
            # If blacklisting is enabled, logout should succeed
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('message', response.data)
        else:
            # If blacklisting is not configured, we expect an error
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn('error', response.data)
    
    def test_logout_without_token(self):
        """Test logout without providing refresh token"""
        # Authenticate the client
        refresh = RefreshToken.for_user(self.test_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {}  # No refresh_token
        response = self.client.post(self.logout_url, data, format='json')
        
        # Should still succeed (logout endpoint doesn't require refresh_token)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_logout_unauthorized(self):
        """Test logout without authentication"""
        data = {
            'refresh_token': 'some_token'
        }
        response = self.client.post(self.logout_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    # ─── Token Refresh Tests ───
    
    def test_refresh_token_success(self):
        """Test successful token refresh"""
        # Authenticate the client
        refresh = RefreshToken.for_user(self.test_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'refresh_token': str(refresh)
        }
        response = self.client.post(self.refresh_token_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIsInstance(response.data['access'], str)
        self.assertGreater(len(response.data['access']), 0)
    
    def test_refresh_token_missing(self):
        """Test token refresh without refresh token"""
        # Authenticate the client
        refresh = RefreshToken.for_user(self.test_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {}  # No refresh_token
        response = self.client.post(self.refresh_token_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_refresh_token_invalid(self):
        """Test token refresh with invalid refresh token"""
        # Authenticate the client
        refresh = RefreshToken.for_user(self.test_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'refresh_token': 'invalid_token_string'
        }
        response = self.client.post(self.refresh_token_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_refresh_token_unauthorized(self):
        """Test token refresh without authentication"""
        data = {
            'refresh_token': 'some_token'
        }
        response = self.client.post(self.refresh_token_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def tearDown(self):
        """Clean up test data after each test"""
        # Delete all test users (Django's TestCase handles DB rollback, but explicit cleanup is good practice)
        User.objects.filter(username__in=['testuser', 'newuser', 'duplicateuser']).delete()
