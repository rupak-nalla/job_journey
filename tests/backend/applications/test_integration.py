"""
Integration tests for complete application workflows
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.db import transaction
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date, timedelta
from applications.models import JobApplication, Interview
import os

User = get_user_model()


class IntegrationTests(TestCase):
    """Integration tests for complete workflows"""
    
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
    
    def test_complete_application_workflow(self):
        """Test complete workflow from creation to deletion"""
        # 1. Create application
        create_url = reverse('add_job_application')
        create_data = {
            'company': 'Workflow Company',
            'position': 'Full Stack Developer',
            'status': 'Applied',
            'applied_date': date.today().isoformat()
        }
        create_response = self.client.post(create_url, create_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        
        # 2. Get the application
        job = JobApplication.objects.get(company='Workflow Company', user=self.user)
        get_url = reverse('get_job_application', args=[job.id])
        get_response = self.client.get(get_url)
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        
        # 3. Update to Interviewing
        update_url = reverse('update_job_application', args=[job.id])
        update_data = {
            'company': 'Workflow Company',
            'position': 'Full Stack Developer',
            'status': 'Interviewing',
            'applied_date': date.today().isoformat(),
            'interview_date': (date.today() + timedelta(days=7)).isoformat(),
            'interview_time': '10:00',
            'interview_type': 'Technical'
        }
        update_response = self.client.put(update_url, update_data, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        
        # 4. Verify interview was created
        interview = Interview.objects.filter(job_application=job).first()
        self.assertIsNotNone(interview)
        
        # 5. Check stats updated
        stats_url = reverse('job_stats')
        stats_response = self.client.get(stats_url)
        stats_data = stats_response.json()
        self.assertEqual(stats_data['interviewing'], 1)
        
        # 6. Check appears in upcoming interviews
        interviews_url = reverse('upcoming_interviews')
        interviews_response = self.client.get(interviews_url)
        interviews_data = interviews_response.json()
        self.assertEqual(len(interviews_data), 1)
        
        # 7. Delete application
        delete_url = reverse('delete_job_application', args=[job.id])
        delete_response = self.client.delete(delete_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 8. Verify deletion
        with self.assertRaises(JobApplication.DoesNotExist):
            JobApplication.objects.get(id=job.id)
        
        # 9. Verify interview was also deleted (cascade)
        self.assertEqual(Interview.objects.filter(id=interview.id).count(), 0)
    
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