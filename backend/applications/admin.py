from django.contrib import admin
from .models import JobApplication, Interview


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('company', 'position', 'user', 'status', 'applied_date')
    list_filter = ('status', 'applied_date', 'user')
    search_fields = ('company', 'position', 'user__username', 'user__email')
    date_hierarchy = 'applied_date'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Application Details', {
            'fields': ('company', 'position', 'status', 'applied_date', 'resume')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'company_website'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('job_description', 'notes'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter applications by user in admin"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
    
    def save_model(self, request, obj, form, change):
        """Auto-assign user if not set"""
        if not obj.user_id:
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('job_application', 'type', 'date', 'time', 'get_user')
    list_filter = ('type', 'date', 'job_application__status')
    search_fields = ('job_application__company', 'job_application__position', 'job_application__user__username')
    date_hierarchy = 'date'
    
    def get_user(self, obj):
        """Display the user who owns the application"""
        return obj.job_application.user.username
    get_user.short_description = 'User'
    get_user.admin_order_field = 'job_application__user'
    
    def get_queryset(self, request):
        """Filter interviews by user in admin"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(job_application__user=request.user)
