"""
Tests for applications models
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db import transaction
from datetime import date, time, timedelta
from applications.models import JobApplication, Interview
from test_utils import JobApplicationTestMixin
import os

User = get_user_model()


class JobApplicationModelTest(JobApplicationTestMixin, TestCase):
    """Test cases for JobApplication model"""
    
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
            status="Applied",
            applied_date=date.today(),
            job_description="Test description",
            contact_email="test@company.com",
            contact_phone="+1234567890",
            company_website="https://testcompany.com",
            notes="Test notes"
        )
    
    def test_job_application_creation(self):
        """Test job application is created correctly"""
        self.assertEqual(self.job_app.company, "Test Company")
        self.assertEqual(self.job_app.position, "Software Engineer")
        self.assertEqual(self.job_app.status, "Applied")
        self.assertIsNotNone(self.job_app.applied_date)
    
    def test_job_application_str(self):
        """Test string representation"""
        expected = f"{self.user.username} - Test Company - Software Engineer"
        self.assertEqual(str(self.job_app), expected)
    
    def test_default_status(self):
        """Test default status is Applied"""
        job = JobApplication.objects.create(
            user=self.user,
            company="Company 2",
            position="Developer"
        )
        self.assertEqual(job.status, "Applied")
    
    def test_status_choices(self):
        """Test all status choices are valid"""
        valid_statuses = ["Applied", "Ghosted", "Interviewing", "Assessment", "Offered"]
        for status_choice in valid_statuses:
            job = JobApplication.objects.create(
                user=self.user,
                company=f"Company {status_choice}",
                position="Engineer",
                status=status_choice
            )
            self.assertEqual(job.status, status_choice)
    
    def test_optional_fields(self):
        """Test optional fields can be null"""
        job = JobApplication.objects.create(
            user=self.user,
            company="Minimal Company",
            position="Position"
        )
        self.assertIsNone(job.job_description)
        self.assertIsNone(job.contact_email)
        self.assertIsNone(job.contact_phone)
        self.assertIsNone(job.company_website)
        self.assertIsNone(job.notes)
    

class InterviewModelTest(JobApplicationTestMixin, TestCase):
    """Test cases for Interview model"""
    
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
            date=date.today() + timedelta(days=7),
            time=time(14, 0),
            type="Technical"
        )
    
    def test_interview_creation(self):
        """Test interview is created correctly"""
        self.assertEqual(self.interview.job_application, self.job_app)
        self.assertEqual(self.interview.type, "Technical")
        self.assertIsNotNone(self.interview.date)
        self.assertIsNotNone(self.interview.time)
    
    def test_interview_str(self):
        """Test string representation"""
        expected = "Test Company - Technical Interview"
        self.assertEqual(str(self.interview), expected)
    
    def test_interview_types(self):
        """Test all interview types are valid"""
        valid_types = ["Technical", "HR", "Behavioral", "Final", "Phone Screen", "System Design"]
        for idx, interview_type in enumerate(valid_types):
            interview = Interview.objects.create(
                job_application=self.job_app,
                date=date.today() + timedelta(days=idx+1),
                time=time(10, 0),
                type=interview_type
            )
            self.assertEqual(interview.type, interview_type)
    
    def test_interview_cascade_delete(self):
        """Test interview is deleted when job application is deleted"""
        interview_id = self.interview.id
        self.job_app.delete()
        with self.assertRaises(Interview.DoesNotExist):
            Interview.objects.get(id=interview_id)
    