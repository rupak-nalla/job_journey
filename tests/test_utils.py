"""
Test utilities shared across backend application tests.
"""

import os

from django.db import transaction

from applications.models import JobApplication


class JobApplicationTestMixin:
    """
    Mixin that provides consistent cleanup for JobApplication test data and
    any associated resume files. Intended to be used alongside Django's
    TestCase, e.g.:

        class MyTest(JobApplicationTestMixin, TestCase):
            ...
    """

    def tearDown(self):
        """
        Clean up job applications and any uploaded resume files for the
        current test user, then delegate to the base TestCase tearDown.
        """
        # Only run cleanup if the test defined a user
        if hasattr(self, "user"):
            # Best-effort DB cleanup – Django's TestCase will also roll back
            try:
                with transaction.atomic():
                    JobApplication.objects.filter(user=self.user).delete()
            except Exception:
                # If the transaction is in a bad state or the query fails,
                # let Django's test teardown handle DB cleanup.
                pass

            # Filesystem cleanup should not depend on DB state
            try:
                self._cleanup_media_files()
            except Exception:
                # File cleanup issues should not break tests
                pass

        # Ensure Django's own TestCase teardown still runs
        try:
            super().tearDown()
        except AttributeError:
            # In case super() has no tearDown (shouldn't happen with TestCase)
            pass

    def _cleanup_media_files(self):
        """
        Remove uploaded resume files belonging to this test's user.
        """
        if not hasattr(self, "user"):
            return

        try:
            with transaction.atomic():
                apps_with_resumes = JobApplication.objects.filter(
                    user=self.user,
                    resume__isnull=False,
                )
                for app in apps_with_resumes:
                    if app.resume:
                        file_path = app.resume.path
                        if os.path.exists(file_path):
                            try:
                                os.remove(file_path)
                            except OSError:
                                # Ignore missing files or OS-level delete issues
                                pass
        except Exception:
            # If the query fails (e.g. broken transaction), Django's test
            # database teardown will clean up model state.
            pass

