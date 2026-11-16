from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'short_description', 'description',
            'category', 'technologies', 'image', 'thumbnail_url',
            'github_url', 'live_url', 'featured', 'order', 'created_at'
        ]

