from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from datetime import date
from .models import JobApplication, Interview
from .serializers import JobApplicationSerializer, InterviewSerializer
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_job_application(request):
    try:
        resume_file = request.FILES.get('resume')  # Handle file
        data = request.data

        job = JobApplication.objects.create(
            user=request.user,  # Link to authenticated user
            company=data.get("company"),
            position=data.get("position"),
            status=data.get("status"),
            applied_date=data.get("applied_date"),
            resume=resume_file,
            job_description=data.get("job_description"),
            contact_email=data.get("contact_email"),
            contact_phone=data.get("contact_phone"),
            company_website=data.get("company_website"),
            notes=data.get("notes")
        )

        # Handle interview data if status is Interviewing
        if data.get("status", "").lower() == "interviewing":
            interview_date = data.get("interview_date")
            interview_time = data.get("interview_time")
            interview_type = data.get("interview_type")
            
            if interview_date:
                Interview.objects.create(
                    job_application=job,
                    date=interview_date,
                    time=interview_time or "10:00",
                    type=interview_type or "Technical"
                )

        return Response({"message": "Application and resume uploaded successfully."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_stats(request):
    # Filter by authenticated user
    user_applications = JobApplication.objects.filter(user=request.user)
    stats = user_applications.values('status').annotate(count=Count('id'))
    summary = {s['status'].lower(): s['count'] for s in stats}
    data = {
        "total": user_applications.count(),
        "applied": summary.get("applied", 0),
        "ghosted": summary.get("ghosted", 0),
        "interviewing": summary.get("interviewing", 0),
        "assessment": summary.get("assessment", 0),
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_applications(request):
    # Filter by authenticated user
    applications = JobApplication.objects.filter(user=request.user).order_by('-applied_date')
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_interviews(request):
    # Filter interviews by user's applications
    user_applications = JobApplication.objects.filter(user=request.user)
    interviews = Interview.objects.filter(
        job_application__in=user_applications,
        date__gte=date.today()
    ).order_by('date', 'time')[:5]
    serializer = InterviewSerializer(interviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def interview_stats(request):
    """Get interview statistics for the authenticated user"""
    from datetime import timedelta
    
    user_applications = JobApplication.objects.filter(user=request.user)
    
    # Get all interviews for user's applications
    all_interviews = Interview.objects.filter(job_application__in=user_applications)
    
    # Upcoming interviews (today and future)
    upcoming_count = all_interviews.filter(date__gte=date.today()).count()
    
    # Completed interviews (in the last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    completed_count = all_interviews.filter(
        date__lt=date.today(),
        date__gte=thirty_days_ago
    ).count()
    
    # Total interviews
    total_count = all_interviews.count()
    
    # Calculate success rate (if we had offer data, but for now just return 0)
    # This could be enhanced later to track offers/acceptances
    success_rate = "0%"
    
    data = {
        "upcoming": upcoming_count,
        "completed": completed_count,
        "total": total_count,
        "success_rate": success_rate,
    }
    return Response(data)


# views.py

# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from .models import JobApplication
# from .serializers import JobApplicationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_job_application(request, pk):
    try:
        # Ensure user can only access their own applications
        job = JobApplication.objects.get(pk=pk, user=request.user)
        serializer = JobApplicationSerializer(job)
        return Response(serializer.data)
    except JobApplication.DoesNotExist:
        return Response({"error": "Job application not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_job_application(request, pk):
    try:
        # Ensure user can only update their own applications
        job = JobApplication.objects.get(pk=pk, user=request.user)
    except JobApplication.DoesNotExist:
        return Response({"error": "Job application not found"}, status=status.HTTP_404_NOT_FOUND)

    # Extract interview data before serialization
    interview_date = request.data.get('interview_date')
    interview_time = request.data.get('interview_time')
    interview_type = request.data.get('interview_type')

    serializer = JobApplicationSerializer(job, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        # Ensure user cannot be changed - always use the original user
        updated_job = serializer.save(user=request.user)
        
        # Handle interview data if status is Interviewing
        if updated_job.status == "Interviewing" and interview_date:
            # Check if interview already exists
            interview, created = Interview.objects.get_or_create(
                job_application=updated_job,
                defaults={
                    'date': interview_date,
                    'time': interview_time or '10:00',
                    'type': interview_type or 'Technical'
                }
            )
            # Update if already exists
            if not created:
                interview.date = interview_date
                interview.time = interview_time or interview.time
                interview.type = interview_type or interview.type
                interview.save()
        
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_job_application(request, pk):
    try:
        # Ensure user can only delete their own applications
        job = JobApplication.objects.get(pk=pk, user=request.user)
        job.delete()
        return Response({"message": "Job application deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except JobApplication.DoesNotExist:
        return Response({"error": "Job application not found"}, status=status.HTTP_404_NOT_FOUND)

