"""
Management command to verify that all job applications are properly linked to users
and that user isolation is working correctly.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from applications.models import JobApplication, Interview


class Command(BaseCommand):
    help = 'Verify that all job applications are linked to users and user isolation is working'

    def handle(self, *args, **options):
        self.stdout.write('Verifying user isolation...\n')
        
        # Check for applications without users
        apps_without_user = JobApplication.objects.filter(user__isnull=True)
        if apps_without_user.exists():
            self.stdout.write(
                self.style.ERROR(
                    f'ERROR: Found {apps_without_user.count()} applications without users!'
                )
            )
            return
        
        self.stdout.write(self.style.SUCCESS('[OK] All applications have users assigned'))
        
        # Check user distribution
        user_counts = {}
        for user in User.objects.all():
            count = JobApplication.objects.filter(user=user).count()
            if count > 0:
                user_counts[user.username] = count
        
        if user_counts:
            self.stdout.write('\nUser application counts:')
            for username, count in user_counts.items():
                self.stdout.write(f'  {username}: {count} applications')
        else:
            self.stdout.write('\nNo applications found in database')
        
        # Check interviews
        total_interviews = Interview.objects.count()
        self.stdout.write(f'\nTotal interviews: {total_interviews}')
        
        # Verify all interviews belong to applications with users
        interviews_without_user = Interview.objects.filter(
            job_application__user__isnull=True
        )
        if interviews_without_user.exists():
            self.stdout.write(
                self.style.ERROR(
                    f'ERROR: Found {interviews_without_user.count()} interviews linked to applications without users!'
                )
            )
            return
        
        self.stdout.write(self.style.SUCCESS('[OK] All interviews are linked to applications with users'))
        
        self.stdout.write(self.style.SUCCESS('\n[OK] User isolation verification complete!'))
