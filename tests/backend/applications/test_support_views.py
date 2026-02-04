"""
Tests for support/contact views
"""
import threading
import time
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class SupportViewsTestCase(TestCase):
    """Test cases for support request submission"""
    
    def setUp(self):
        """Set up test client and user"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
    def test_submit_support_request_success_unauthenticated(self):
        """Test successful support request submission by unauthenticated user"""
        data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'subject': 'Test Subject',
            'message': 'This is a test message'
        }
        
        # Clear mail outbox before test
        mail.outbox.clear()
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.json())
        self.assertIn('submitted successfully', response.json()['message'])
        
        # Wait a bit for the background thread to complete
        time.sleep(0.5)
        
        # Verify email was sent (in background thread)
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('Test Subject', email.subject)
        self.assertIn('john@example.com', email.body)
        self.assertIn('This is a test message', email.body)
        
    def test_submit_support_request_success_authenticated(self):
        """Test successful support request submission by authenticated user"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'subject': 'Authenticated Request',
            'message': 'Test message from authenticated user'
        }
        
        mail.outbox.clear()
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Wait for background thread
        time.sleep(0.5)
        
        # Verify email contains user info
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('testuser', email.body)
        self.assertIn(str(self.user.id), email.body)
        
    def test_submit_support_request_missing_required_fields(self):
        """Test support request with missing required fields"""
        # Missing name
        data = {
            'email': 'test@example.com',
            'message': 'Test message'
        }
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
        self.assertIn('required', response.json()['error'])
        
        # Missing email
        data = {
            'name': 'Test User',
            'message': 'Test message'
        }
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Missing message
        data = {
            'name': 'Test User',
            'email': 'test@example.com'
        }
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_submit_support_request_empty_fields(self):
        """Test support request with empty string fields"""
        data = {
            'name': '   ',  # Only whitespace
            'email': 'test@example.com',
            'message': 'Test message'
        }
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_submit_support_request_immediate_response(self):
        """Test that response is returned immediately without waiting for email"""
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'message': 'Test message'
        }
        
        mail.outbox.clear()
        
        # Mock send_mail to take some time (simulate slow SMTP)
        from unittest.mock import patch
        from django.core.mail import send_mail as original_send_mail
        
        def slow_send_mail(*args, **kwargs):
            time.sleep(0.5)  # Simulate slow email sending
            return original_send_mail(*args, **kwargs)
        
        with patch('applications.support_views.send_mail', side_effect=slow_send_mail):
            start_time = time.time()
            response = self.client.post(
                '/api/support/',
                data=data,
                format='json'
            )
            response_time = time.time() - start_time
            
            # Response should be immediate (< 100ms), not waiting for email
            self.assertLess(response_time, 0.1, 
                          "Response should be immediate, not waiting for email")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Wait for background email to complete
            time.sleep(0.6)
            
            # Email should still be sent in background
            self.assertEqual(len(mail.outbox), 1)
            
    def test_submit_support_request_email_failure_doesnt_block(self):
        """Test that email failure doesn't block the response"""
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'message': 'Test message'
        }
        
        # Mock send_mail to raise an exception
        from unittest.mock import patch
        
        with patch('applications.support_views.send_mail', side_effect=Exception("SMTP Error")):
            response = self.client.post(
                '/api/support/',
                data=data,
                format='json'
            )
            
            # Response should still be successful
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('submitted successfully', response.json()['message'])
            
            # Wait for background thread to complete
            time.sleep(0.5)
            
            # No email should be sent
            self.assertEqual(len(mail.outbox), 0)
            
    def test_submit_support_request_email_in_background_thread(self):
        """Test that email is sent in a background thread"""
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'message': 'Test message'
        }
        
        mail.outbox.clear()
        
        # Track if email sending happens in main thread
        email_thread_id = None
        main_thread_id = threading.current_thread().ident
        
        from unittest.mock import patch
        from django.core.mail import send_mail as original_send_mail
        
        def track_thread_send_mail(*args, **kwargs):
            nonlocal email_thread_id
            email_thread_id = threading.current_thread().ident
            return original_send_mail(*args, **kwargs)
        
        with patch('applications.support_views.send_mail', side_effect=track_thread_send_mail):
            response = self.client.post(
                '/api/support/',
                data=data,
                format='json'
            )
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Wait for background thread to complete
            time.sleep(0.5)
            
            # Verify email was sent in a different thread
            self.assertIsNotNone(email_thread_id)
            self.assertNotEqual(email_thread_id, main_thread_id,
                              "Email should be sent in background thread, not main thread")
            
    def test_submit_support_request_subject_optional(self):
        """Test that subject field is optional"""
        data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'message': 'Test message without subject'
        }
        
        mail.outbox.clear()
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        time.sleep(0.5)
        
        # Email should still be sent with default subject
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertIn('Support Request', email.subject)
        
    def test_submit_support_request_xss_protection(self):
        """Test that user input is properly escaped to prevent XSS"""
        data = {
            'name': '<script>alert("xss")</script>',
            'email': 'test@example.com',
            'subject': '<img src=x onerror=alert(1)>',
            'message': '<script>malicious()</script>'
        }
        
        mail.outbox.clear()
        
        response = self.client.post(
            '/api/support/',
            data=data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        time.sleep(0.5)
        
        # Verify email content is escaped
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        # Script tags should be escaped, not executed
        self.assertIn('&lt;script&gt;', email.body)
        self.assertNotIn('<script>', email.body)
        
    def test_submit_support_request_concurrent_requests(self):
        """Test handling multiple concurrent support requests"""
        mail.outbox.clear()
        
        def submit_request(index):
            data = {
                'name': f'User {index}',
                'email': f'user{index}@example.com',
                'message': f'Message {index}'
            }
            return self.client.post(
                '/api/support/',
                data=data,
                format='json'
            )
        
        # Submit 5 concurrent requests
        threads = []
        responses = []
        
        def make_request(index):
            response = submit_request(index)
            responses.append((index, response))
        
        for i in range(5):
            thread = threading.Thread(target=make_request, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Wait for background email threads
        time.sleep(1)
        
        # All requests should succeed
        self.assertEqual(len(responses), 5)
        for index, response in responses:
            self.assertEqual(response.status_code, status.HTTP_200_OK, 
                           f"Request {index} should succeed")
        
        # All emails should be sent
        self.assertEqual(len(mail.outbox), 5)
    
    def tearDown(self):
        """Clean up test data after each test"""
        # Clear mail outbox
        mail.outbox.clear()
        # Delete test user (Django's TestCase handles DB rollback, but explicit cleanup is good practice)
        User.objects.filter(username='testuser').delete()
