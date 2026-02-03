# Generated migration to make user field required

from django.db import migrations, models
from django.contrib.auth.models import User


def delete_applications_without_user(apps, schema_editor):
    """Delete any applications that don't have a user assigned"""
    JobApplication = apps.get_model('applications', 'JobApplication')
    # Delete all applications without a user
    JobApplication.objects.filter(user__isnull=True).delete()


def reverse_delete(apps, schema_editor):
    """Reverse operation - nothing to do"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('applications', '0007_add_user_to_job_application'),
    ]

    operations = [
        # First, delete any applications without users
        migrations.RunPython(delete_applications_without_user, reverse_delete),
        
        # Then make the user field required
        migrations.AlterField(
            model_name='jobapplication',
            name='user',
            field=models.ForeignKey(
                on_delete=models.CASCADE,
                related_name='job_applications',
                to='auth.user',
                help_text='The user who owns this job application'
            ),
        ),
        
        # Add indexes for better performance
        migrations.AddIndex(
            model_name='jobapplication',
            index=models.Index(fields=['user', 'applied_date'], name='applications_user_applied_idx'),
        ),
        migrations.AddIndex(
            model_name='jobapplication',
            index=models.Index(fields=['user', 'status'], name='applications_user_status_idx'),
        ),
        
        # Add index to Interview model
        migrations.AddIndex(
            model_name='interview',
            index=models.Index(fields=['date', 'time'], name='applications_interview_date_time_idx'),
        ),
        migrations.AddIndex(
            model_name='interview',
            index=models.Index(fields=['job_application', 'date'], name='applications_interview_app_date_idx'),
        ),
    ]
