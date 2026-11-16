from django.contrib import admin
from .models import Achievement, PageEvent

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'issuer', 'date_achieved', 'order')
    list_editable = ('order',)
    list_filter = ('category', 'issuer')

@admin.register(PageEvent)
class PageEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'path', 'ip_address', 'created_at')
    list_filter = ('event_type', 'created_at')
    readonly_fields = ('event_type', 'path', 'ip_address', 'user_agent', 'created_at')

