from django.contrib import admin
from .models import Profile, Education, SocialLink

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'email', 'updated_at')
    fieldsets = (
        ('Personal Info', {
            'fields': ('name', 'title', 'tagline', 'bio', 'career_goal')
        }),
        ('Contact & Location', {
            'fields': ('email', 'location')
        }),
        ('Media & Files', {
            'fields': ('avatar', 'resume')
        }),
    )

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'institution', 'start_year', 'end_year', 'is_current', 'order')
    list_editable = ('order',)
    list_filter = ('is_current', 'start_year')

@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('platform', 'url', 'icon_name', 'is_active', 'order')
    list_editable = ('is_active', 'order')

