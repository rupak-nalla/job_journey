"""
Integration tests for complete application workflows
"""
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from datetime import date, timedelta
from applications.models import JobApplication, Interview
import json


class IntegrationTests(TestCase):
    """Integration tests for complete workflows"""
    
    def setUp(self):
        self.client = Client()
    
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
        create_response = self.client.post(
            create_url,
            create_data,
            content_type='application/json'
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        
        # 2. Get the application
        job = JobApplication.objects.get(company='Workflow Company')
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
        update_response = self.client.put(
            update_url,
            json.dumps(update_data),
            content_type='application/json'
        )
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
