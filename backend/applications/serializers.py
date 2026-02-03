# serializers.py

from rest_framework import serializers
from .models import JobApplication, Interview

# class JobApplicationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = JobApplication
#         fields = ['company', 'position', 'applied_date', 'status']
# serializers.py

class JobApplicationSerializer(serializers.ModelSerializer):
    interview_date = serializers.SerializerMethodField()
    interview_time = serializers.SerializerMethodField()
    interview_type = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = ['id', 'company', 'position', 'applied_date', 'status', 'resume',
                  'job_description', 'contact_email', 'contact_phone', 'company_website', 'notes',
                  'interview_date', 'interview_time', 'interview_type']

    def get_interview_date(self, obj):
        interview = Interview.objects.filter(job_application=obj).first()
        return interview.date if interview else None

    def get_interview_time(self, obj):
        interview = Interview.objects.filter(job_application=obj).first()
        return interview.time if interview else None

    def get_interview_type(self, obj):
        interview = Interview.objects.filter(job_application=obj).first()
        return interview.type if interview else None


class InterviewSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source='job_application.company')
    position = serializers.CharField(source='job_application.position')

    class Meta:
        model = Interview
        fields = ['id', 'company', 'position', 'date', 'time', 'type']
