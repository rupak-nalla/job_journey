"""
Legacy support/contact endpoint.

The email-based support feature has been removed. This endpoint is kept only so
that any old clients hitting `/api/support/` receive a clear message instead of
an error.
"""
import logging

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

logger = logging.getLogger('applications')


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated users to hit this safely
def submit_support_request(request):
    """
    Inform callers that support email has been disabled.
    """
    logger.info("Support endpoint called, but email feature is disabled.")
    return Response(
        {
            "error": "Support email feature has been disabled. "
                     "Please contact us directly at rupaknalla1034@gmail.com."
        },
        status=status.HTTP_410_GONE,
    )
