"""
Tests for applications serializers
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import transaction
from datetime import date, time, timedelta
from applications.models import JobApplication, Interview
from applications.serializers import JobApplicationSerializer, InterviewSerializer
import os

User = get_user_model()


class JobApplicationSerializerTest(TestCase):
    """Test cases for JobApplication serializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.job_app = JobApplication.objects.create(
            user=self.user,
            company="Test Company",
            position="Software Engineer",
            status="Interviewing",
            applied_date=date.today()
        )
        self.interview = Interview.objects.create(
            job_application=self.job_app,
            date=date.today() + timedelta(days=5),
            time=time(15, 30),
            type="HR"
        )
    
    def test_serializer_with_interview(self):
        """Test serializer includes interview data"""
        serializer = JobApplicationSerializer(self.job_app)
        data = serializer.data
        
        self.assertEqual(data['company'], "Test Company")
        self.assertEqual(data['position'], "Software Engineer")
        self.assertEqual(data['status'], "Interviewing")
        self.assertIsNotNone(data['interview_date'])
        self.assertIsNotNone(data['interview_time'])
        self.assertEqual(data['interview_type'], "HR")
    
    def test_serializer_without_interview(self):
        """Test serializer handles no interview gracefully"""
        job = JobApplication.objects.create(
            user=self.user,
            company="No Interview Company",
            position="Developer",
            status="Applied"
        )
        serializer = JobApplicationSerializer(job)
        data = serializer.data
        
        self.assertIsNone(data['interview_date'])
        self.assertIsNone(data['interview_time'])
        self.assertIsNone(data['interview_type'])
    
    def tearDown(self):
        """Clean up test data after each test, even if test fails"""
        try:
            # Rollback any broken transaction first
            transaction.rollback()
        except Exception:
            pass  # No transaction to rollback or already rolled back
        
        try:
            # Delete all job applications (cascades to interviews)
            # Use atomic block to ensure this works even after errors
            with transaction.atomic():
                JobApplication.objects.filter(user=self.user).delete()
        except Exception:
            # If deletion fails (e.g., transaction broken), Django's TestCase will handle it
            pass
        
        # Always try to clean up files (filesystem operations don't depend on DB state)
        try:
            self._cleanup_media_files()
        except Exception:
            pass  # File cleanup failures shouldn't break tests
    
    def _cleanup_media_files(self):
        """Remove uploaded files from media directory"""
        try:
            # Get all job applications with resumes
            # Use atomic block to ensure query works even after errors
            with transaction.atomic():
                apps_with_resumes = JobApplication.objects.filter(resume__isnull=False)
                for app in apps_with_resumes:
                    if app.resume:
                        file_path = app.resume.path
                        if os.path.exists(file_path):
                            try:
                                os.remove(file_path)
                            except OSError:
                                pass  # File might already be deleted
        except Exception:
            pass  # If query fails, files will be cleaned up by Django's test database teardown


class InterviewSerializerTest(TestCase):
    """Test cases for Interview serializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.job_app = JobApplication.objects.create(
            user=self.user,
            company="Test Company",
            position="Software Engineer",
            status="Interviewing"
        )
        self.interview = Interview.objects.create(
            job_application=self.job_app,
            date=date.today() + timedelta(days=3),
            time=time(10, 0),
            type="Technical"
        )
    
    def test_interview_serializer(self):
        """Test interview serializer includes job application data"""
        serializer = InterviewSerializer(self.interview)
        data = serializer.data
        
        self.assertEqual(data['company'], "Test Company")
        self.assertEqual(data['position'], "Software Engineer")
        self.assertEqual(data['type'], "Technical")
        self.assertIsNotNone(data['date'])
        self.assertIsNotNone(data['time'])
    
    def tearDown(self):
        """Clean up test data after each test, even if test fails"""
        try:
            # Rollback any broken transaction first
            transaction.rollback()
        except Exception:
            pass  # No transaction to rollback or already rolled back
        
        try:
            # Delete all job applications (cascades to interviews)
            # Use atomic block to ensure this works even after errors
            with transaction.atomic():
                JobApplication.objects.filter(user=self.user).delete()
        except Exception:
            # If deletion fails (e.g., transaction broken), Django's TestCase will handle it
            pass
        
        # Always try to clean up files (filesystem operations don't depend on DB state)
        try:
            self._cleanup_media_files()
        except Exception:
            pass  # File cleanup failures shouldn't break tests
    
    def _cleanup_media_files(self):
        """Remove uploaded files from media directory"""
        try:
            # Get all job applications with resumes
            # Use atomic block to ensure query works even after errors
            with transaction.atomic():
                apps_with_resumes = JobApplication.objects.filter(resume__isnull=False)
                for app in apps_with_resumes:
                    if app.resume:
                        file_path = app.resume.path
                        if os.path.exists(file_path):
                            try:
                                os.remove(file_path)
                            except OSError:
                                pass  # File might already be deleted
        except Exception:
            pass  # If query fails, files will be cleaned up by Django's test database teardown