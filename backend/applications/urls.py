# applications/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import  delete_job_application,update_job_application,get_job_application,job_stats, recent_applications, upcoming_interviews,add_job_application,interview_stats
from .auth_views import register, login, logout, get_user, refresh_token
from .support_views import submit_support_request

router = DefaultRouter()
# router.register(r'jobs', JobApplicationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/auth/register/', register, name='register'),
    path('api/auth/login/', login, name='login'),
    path('api/auth/logout/', logout, name='logout'),
    path('api/auth/user/', get_user, name='get_user'),
    path('api/auth/refresh/', refresh_token, name='refresh_token'),
    
    # JWT token endpoints (alternative)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Application endpoints
    path('api/add-job-application/', add_job_application, name='add_job_application'),
    path('api/job-stats/', job_stats, name='job_stats'),
    path('api/recent-applications/', recent_applications, name='recent_applications'),
    path('api/upcoming-interviews/', upcoming_interviews, name='upcoming_interviews'),
    path('api/interview-stats/', interview_stats, name='interview_stats'),
    path('api/applications/<int:pk>/', get_job_application, name='get_job_application'),
    path('api/applications/<int:pk>/update/', update_job_application, name='update_job_application'),
    path('api/applications/<int:pk>/delete/', delete_job_application, name='delete_job_application'),
    
    # Support/Contact endpoint
    path('api/support/', submit_support_request, name='submit_support_request'),
]
