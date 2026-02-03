from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from datetime import date
from .models import JobApplication, Interview
from .serializers import JobApplicationSerializer, InterviewSerializer
from rest_framework import status

@api_view(['POST'])
def add_job_application(request):
    try:
        resume_file = request.FILES.get('resume')  # Handle file
        data = request.data

        job = JobApplication.objects.create(
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
def job_stats(request):
    stats = JobApplication.objects.values('status').annotate(count=Count('id'))
    summary = {s['status'].lower(): s['count'] for s in stats}
    data = {
        "total": JobApplication.objects.count(),
        "applied": summary.get("applied", 0),
        "ghosted": summary.get("ghosted", 0),
        "interviewing": summary.get("interviewing", 0),
        "assessment": summary.get("assessment", 0),
    }
    return Response(data)


@api_view(['GET'])
def recent_applications(request):
    applications = JobApplication.objects.order_by('-applied_date')
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def upcoming_interviews(request):
    interviews = Interview.objects.filter(date__gte=date.today()).order_by('date', 'time')[:5]
    serializer = InterviewSerializer(interviews, many=True)
    return Response(serializer.data)


# views.py

# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from .models import JobApplication
# from .serializers import JobApplicationSerializer

@api_view(['GET'])
def get_job_application(request, pk):
    try:
        job = JobApplication.objects.get(pk=pk)
        serializer = JobApplicationSerializer(job)
        return Response(serializer.data)
    except JobApplication.DoesNotExist:
        return Response({"error": "Job application not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT', 'PATCH'])
def update_job_application(request, pk):
    try:
        job = JobApplication.objects.get(pk=pk)
    except JobApplication.DoesNotExist:
        return Response({"error": "Job application not found"}, status=status.HTTP_404_NOT_FOUND)

    # Extract interview data before serialization
    interview_date = request.data.get('interview_date')
    interview_time = request.data.get('interview_time')
    interview_type = request.data.get('interview_type')

    serializer = JobApplicationSerializer(job, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        updated_job = serializer.save()
        
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
def delete_job_application(request, pk):
    try:
        job = JobApplication.objects.get(pk=pk)
        job.delete()
        return Response({"message": "Job application deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except JobApplication.DoesNotExist:
        return Response({"error": "Job application not found"}, status=status.HTTP_404_NOT_FOUND)

