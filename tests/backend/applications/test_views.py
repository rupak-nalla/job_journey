"""
Tests for applications API views
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import transaction
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date, time, timedelta
from applications.models import JobApplication, Interview
from django.conf import settings
from test_utils import JobApplicationTestMixin
import json
import os
import shutil

User = get_user_model()


class APIEndpointTests(JobApplicationTestMixin, TestCase):
    """Test cases for API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # Authenticate the client
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        self.job_app1 = JobApplication.objects.create(
            user=self.user,
            company="Company A",
            position="Developer",
            status="Applied",
            applied_date=date.today()
        )
        self.job_app2 = JobApplication.objects.create(
            user=self.user,
            company="Company B",
            position="Engineer",
            status="Interviewing",
            applied_date=date.today() - timedelta(days=1)
        )
        self.interview = Interview.objects.create(
            job_application=self.job_app2,
            date=date.today() + timedelta(days=2),
            time=time(14, 0),
            type="Technical"
        )
    
    def test_add_job_application(self):
        """Test adding a new job application"""
        url = reverse('add_job_application')
        data = {
            'company': 'New Company',
            'position': 'Data Scientist',
            'status': 'Applied',
            'applied_date': date.today().isoformat(),
            'job_description': 'Test description',
            'contact_email': 'hr@newcompany.com'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.json())
        self.assertEqual(JobApplication.objects.filter(user=self.user).count(), 3)
    
    def test_add_job_application_with_interview(self):
        """Test adding job application with interview"""
        url = reverse('add_job_application')
        data = {
            'company': 'Interview Company',
            'position': 'Full Stack Developer',
            'status': 'Interviewing',
            'applied_date': date.today().isoformat(),
            'interview_date': (date.today() + timedelta(days=5)).isoformat(),
            'interview_time': '10:00',
            'interview_type': 'HR'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check interview was created
        job = JobApplication.objects.get(company='Interview Company', user=self.user)
        interview = Interview.objects.filter(job_application=job).first()
        self.assertIsNotNone(interview)
        self.assertEqual(interview.type, 'HR')
    
    def test_job_stats(self):
        """Test job statistics endpoint"""
        url = reverse('job_stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertIn('total', data)
        self.assertIn('applied', data)
        self.assertIn('interviewing', data)
        self.assertEqual(data['total'], 2)
        self.assertEqual(data['applied'], 1)
        self.assertEqual(data['interviewing'], 1)
    
    def test_recent_applications(self):
        """Test recent applications endpoint"""
        url = reverse('recent_applications')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(len(data), 2)
        # Should be ordered by date (newest first)
        self.assertEqual(data[0]['company'], 'Company A')
    
    def test_upcoming_interviews(self):
        """Test upcoming interviews endpoint"""
        url = reverse('upcoming_interviews')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['company'], 'Company B')
        self.assertEqual(data[0]['type'], 'Technical')
    
    def test_get_job_application(self):
        """Test getting single job application"""
        url = reverse('get_job_application', args=[self.job_app1.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['company'], 'Company A')
        self.assertEqual(data['position'], 'Developer')
    
    def test_get_nonexistent_job_application(self):
        """Test getting non-existent job application returns 404"""
        url = reverse('get_job_application', args=[9999])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_job_application_put(self):
        """Test updating job application with PUT"""
        url = reverse('update_job_application', args=[self.job_app1.id])
        data = {
            'company': 'Updated Company',
            'position': 'Senior Developer',
            'status': 'Applied',
            'applied_date': date.today().isoformat()
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify update
        self.job_app1.refresh_from_db()
        self.assertEqual(self.job_app1.company, 'Updated Company')
        self.assertEqual(self.job_app1.position, 'Senior Developer')
    
    def test_update_job_application_patch(self):
        """Test partial update with PATCH"""
        url = reverse('update_job_application', args=[self.job_app1.id])
        data = {'status': 'Ghosted'}
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify update
        self.job_app1.refresh_from_db()
        self.assertEqual(self.job_app1.status, 'Ghosted')
        # Other fields should remain unchanged
        self.assertEqual(self.job_app1.company, 'Company A')
    
    def test_update_to_interviewing_creates_interview(self):
        """Test updating status to Interviewing creates interview"""
        url = reverse('update_job_application', args=[self.job_app1.id])
        data = {
            'company': 'Company A',
            'position': 'Developer',
            'status': 'Interviewing',
            'applied_date': date.today().isoformat(),
            'interview_date': (date.today() + timedelta(days=3)).isoformat(),
            'interview_time': '14:30',
            'interview_type': 'Behavioral'
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check interview was created
        interview = Interview.objects.filter(job_application=self.job_app1).first()
        self.assertIsNotNone(interview)
        self.assertEqual(interview.type, 'Behavioral')
    
    def test_delete_job_application(self):
        """Test deleting job application"""
        url = reverse('delete_job_application', args=[self.job_app1.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify deletion
        with self.assertRaises(JobApplication.DoesNotExist):
            JobApplication.objects.get(id=self.job_app1.id)
    
    def test_delete_nonexistent_job_application(self):
        """Test deleting non-existent job application returns 404"""
        url = reverse('delete_job_application', args=[9999])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    

class FileUploadTest(JobApplicationTestMixin, TestCase):
    """Test cases for file upload functionality"""
    
    def setUp(self):
        self.client = APIClient()
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # Authenticate the client
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_upload_resume(self):
        """Test uploading resume file"""
        url = reverse('add_job_application')
        
        # Create a fake PDF file
        resume_content = b'%PDF-1.4 fake pdf content'
        resume = SimpleUploadedFile(
            "test_resume.pdf",
            resume_content,
            content_type="application/pdf"
        )
        
        data = {
            'company': 'File Upload Company',
            'position': 'Developer',
            'status': 'Applied',
            'applied_date': date.today().isoformat(),
            'resume': resume
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify file was saved
        job = JobApplication.objects.get(company='File Upload Company')
        self.assertIsNotNone(job.resume)
        self.assertTrue(job.resume.name.endswith('.pdf'))
    

class EdgeCaseTests(JobApplicationTestMixin, TestCase):
    """Test edge cases and error handling"""
    
    def setUp(self):
        self.client = APIClient()
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # Authenticate the client
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_add_application_missing_required_fields(self):
        """Test adding application without required fields"""
        url = reverse('add_job_application')
        data = {'company': 'Incomplete Company'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    
    def test_past_interview_date(self):
        """Test that past interviews don't appear in upcoming"""
        job = JobApplication.objects.create(
            user=self.user,
            company="Past Interview",
            position="Engineer",
            status="Interviewing"
        )
        Interview.objects.create(
            job_application=job,
            date=date.today() - timedelta(days=1),
            time=time(10, 0),
            type="Technical"
        )
        
        url = reverse('upcoming_interviews')
        response = self.client.get(url)
        data = response.json()
        
        # Should not include past interview
        self.assertEqual(len(data), 0)
    
    def test_multiple_interviews_limit(self):
        """Test upcoming interviews returns max 5 interviews"""
        job = JobApplication.objects.create(
            user=self.user,
            company="Multiple Interviews",
            position="Engineer",
            status="Interviewing"
        )
        
        # Create 7 interviews
        for i in range(7):
            Interview.objects.create(
                job_application=job,
                date=date.today() + timedelta(days=i+1),
                time=time(10, 0),
                type="Technical"
            )
        
        url = reverse('upcoming_interviews')
        response = self.client.get(url)
        data = response.json()
        
        # Should return only 5
        self.assertEqual(len(data), 5)
