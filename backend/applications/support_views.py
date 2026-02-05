"""
Support/Contact views for handling user support requests
"""
import logging
import threading
import time
import socket
from django.core.mail import send_mail, get_connection
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
            """Send email in background thread with retry logic"""
            max_retries = 3
            retry_delay = 2  # Start with 2 seconds
            
            for attempt in range(1, max_retries + 1):
                try:
                    # Use a connection with timeout to prevent hanging on network issues
                    email_timeout = getattr(settings, 'EMAIL_TIMEOUT', 10)
                    connection = get_connection(
                        backend=settings.EMAIL_BACKEND,
                        timeout=email_timeout,
                    )
                    
                    send_mail(
                        subject=email_subject,
                        message=email_body,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[settings.SUPPORT_EMAIL],
                        fail_silently=False,
                        connection=connection,
                    )
                    logger.info(f'Support request email sent successfully from {email}')
                    return  # Success, exit the function
                    
                except (OSError, socket.error, socket.gaierror) as network_error:
                    # Network-related errors (unreachable, timeout, DNS, etc.)
                    error_msg = str(network_error)
                    error_code = getattr(network_error, 'errno', None)
                    
                    if attempt < max_retries:
                        # Log warning and retry
                        logger.warning(
                            f'Network error sending support email (attempt {attempt}/{max_retries}): '
                            f'{error_msg} (errno: {error_code}). Retrying in {retry_delay}s...'
                        )
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff: 2s, 4s, 8s
                    else:
                        # Final attempt failed
                        logger.error(
                            f'Failed to send support email after {max_retries} attempts due to network error: '
                            f'{error_msg} (errno: {error_code}). '
                            f'Support request from {email} was received but email delivery failed.',
                            exc_info=True
                        )
                        # Log the support request details for manual follow-up
                        logger.info(
                            f'Support request details (email delivery failed): '
                            f'Name={name}, Email={email}, Subject={subject or "No subject"}'
                        )
                        
                except Exception as email_error:
                    # Other email errors (authentication, configuration, etc.)
                    logger.error(
                        f'Failed to send support email (non-network error): {email_error}. '
                        f'Support request from {email} was received but email delivery failed.',
                        exc_info=True
                    )
                    # Log the support request details for manual follow-up
                    logger.info(
                        f'Support request details (email delivery failed): '
                        f'Name={name}, Email={email}, Subject={subject or "No subject"}'
                    )
                    return  # Don't retry for non-network errors
        
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
