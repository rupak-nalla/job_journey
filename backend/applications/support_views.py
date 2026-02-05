"""
Support/Contact views for handling user support requests
"""
import logging
import threading
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.html import escape

logger = logging.getLogger('applications')

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated users to submit support requests
def submit_support_request(request):
    """
    Handle support/contact form submissions.
    Sends an email to the support email address with user details.
    
    Optimized to send emails asynchronously in a background thread,
    so users receive an immediate response without waiting for email delivery.
    Email failures are logged but don't affect the user response.
    """
    try:
        # Extract form data
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        subject = request.data.get('subject', '').strip()
        message = request.data.get('message', '').strip()
        
        # Validate required fields
        if not name or not email or not message:
            return Response(
                {'error': 'Name, email, and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user info if authenticated
        user_info = ""
        if request.user.is_authenticated:
            user_info = f"""
User Account Information:
- Username: {request.user.username}
- User ID: {request.user.id}
- Email: {request.user.email}
"""
        
        # Prepare email content
        email_subject = f"[JobTracker Support] {subject or 'Support Request'}"
        email_body = f"""
New support request received from JobTracker:

From: {escape(name)}
Email: {escape(email)}
{user_info}
Subject: {escape(subject) if subject else 'No subject provided'}

Message:
{escape(message)}

---
This message was sent from the JobTracker application support form.
"""
        
        # Send email in background thread to avoid blocking the response
        def send_email_async():
            """Send email in background thread"""
            try:
                send_mail(
                    subject=email_subject,
                    message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.SUPPORT_EMAIL],
                    fail_silently=False,
                )
                logger.info(f'Support request email sent successfully from {email}')
            except Exception as email_error:
                # Log error but don't block the user response
                logger.error(f'Failed to send support email: {email_error}', exc_info=True)
        
        # Start email sending in background thread
        email_thread = threading.Thread(target=send_email_async, daemon=True)
        email_thread.start()
        
        # Return success response immediately without waiting for email
        logger.info(f'Support request submitted from {email} (email sending in background)')
        return Response(
            {'message': 'Your support request has been submitted successfully. We will get back to you soon.'},
            status=status.HTTP_200_OK
        )
            
    except Exception as e:
        logger.exception('Error processing support request')
        return Response(
            {'error': 'An error occurred processing your request'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
