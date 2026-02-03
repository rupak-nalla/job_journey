from django.db import models
from django.utils import timezone
from datetime import date as date_func

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied", "Applied"),
        ("Ghosted", "Ghosted"),
        ("Interviewing", "Interviewing"),
        ("Assessment", "Assessment"),
    ]

    company = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    applied_date = models.DateField(default=date_func.today)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    
    # Additional details
    job_description = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.company} - {self.position}"


class Interview(models.Model):
    TYPE_CHOICES = [
        ("Technical", "Technical"),
        ("HR", "HR"),
        ("Behavioral", "Behavioral"),
        ("Final", "Final"),
        ("Phone Screen", "Phone Screen"),
        ("System Design", "System Design"),
    ]

    job_application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name="interviews")
    date = models.DateField()
    time = models.TimeField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    def __str__(self):
        return f"{self.job_application.company} - {self.type} Interview"
