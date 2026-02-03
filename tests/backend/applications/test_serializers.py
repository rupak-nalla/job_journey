"""
Tests for applications serializers
"""
from django.test import TestCase
from datetime import date, time, timedelta
from applications.models import JobApplication, Interview
from applications.serializers import JobApplicationSerializer, InterviewSerializer


class JobApplicationSerializerTest(TestCase):
    """Test cases for JobApplication serializer"""
    
    def setUp(self):
        self.job_app = JobApplication.objects.create(
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
            company="No Interview Company",
            position="Developer",
            status="Applied"
        )
        serializer = JobApplicationSerializer(job)
        data = serializer.data
        
        self.assertIsNone(data['interview_date'])
        self.assertIsNone(data['interview_time'])
        self.assertIsNone(data['interview_type'])


class InterviewSerializerTest(TestCase):
    """Test cases for Interview serializer"""
    
    def setUp(self):
        self.job_app = JobApplication.objects.create(
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
