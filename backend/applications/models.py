from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import date as date_func

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("Applied", "Applied"),
        ("Ghosted", "Ghosted"),
        ("Interviewing", "Interviewing"),
        ("Assessment", "Assessment"),
        ("Offered", "Offered"),
    ]

    # User is required - all applications must belong to a user
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='job_applications',
        db_index=True,  # Index for faster queries
        help_text="The user who owns this job application"
    )
    company = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    applied_date = models.DateField(default=date_func.today, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Applied")
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    
    # Additional details
    job_description = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        # Composite index for common query patterns
        indexes = [
            models.Index(fields=['user', 'applied_date']),
            models.Index(fields=['user', 'status']),
        ]
        # Ordering for default queries
        ordering = ['-applied_date']
        # Unique constraint: prevent duplicate applications (same user, company, position)
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'company', 'position'],
                name='unique_user_application',
                condition=models.Q(status__in=['Applied', 'Interviewing', 'Assessment', 'Offered']),
            ),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.company} - {self.position}"


class Interview(models.Model):
    TYPE_CHOICES = [
        ("Technical", "Technical"),
        ("HR", "HR"),
        ("Behavioral", "Behavioral"),
        ("Final", "Final"),
        ("Phone Screen", "Phone Screen"),
        ("System Design", "System Design"),
    ]

    job_application = models.ForeignKey(
        JobApplication, 
        on_delete=models.CASCADE, 
        related_name="interviews",
        db_index=True
    )
    date = models.DateField(db_index=True)
    time = models.TimeField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    class Meta:
        # Index for filtering upcoming interviews
        indexes = [
            models.Index(fields=['date', 'time']),
            models.Index(fields=['job_application', 'date']),
        ]
        # Ordering for default queries
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.job_application.company} - {self.type} Interview"
    
    @property
    def user(self):
        """Convenience property to access the user through job_application"""
        return self.job_application.user