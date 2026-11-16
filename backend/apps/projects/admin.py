from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'featured', 'order', 'created_at')
    list_editable = ('featured', 'order')
    list_filter = ('featured', 'category')
    search_fields = ('title', 'short_description', 'description')
    prepopulated_fields = {'slug': ('title',)}

