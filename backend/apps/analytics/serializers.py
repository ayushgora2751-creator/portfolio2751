from rest_framework import serializers
from .models import Achievement, PageEvent

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'title', 'category', 'issuer', 'date_achieved', 'description', 'credential_url', 'order']

class PageEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageEvent
        fields = ['id', 'event_type', 'path', 'created_at']

