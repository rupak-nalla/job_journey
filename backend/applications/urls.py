# applications/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  delete_job_application,update_job_application,get_job_application,job_stats, recent_applications, upcoming_interviews,add_job_application

router = DefaultRouter()
# router.register(r'jobs', JobApplicationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/add-job-application/', add_job_application),
    path('api/job-stats/', job_stats),
    path('api/recent-applications/', recent_applications),
    path('api/upcoming-interviews/', upcoming_interviews),
    path('api/applications/<int:pk>/', get_job_application),
    path('api/applications/<int:pk>/update/', update_job_application),
    path('api/applications/<int:pk>/delete/', delete_job_application),
]
