from rest_framework import serializers
from .models import Profile, Education, SocialLink

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'institution', 'degree', 'field_of_study',
            'start_year', 'end_year', 'is_current', 'description', 'order'
        ]

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'icon_name', 'is_active', 'order']

class ProfileSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True, read_only=True, source='education_set')
    social_links = SocialLinkSerializer(many=True, read_only=True, source='sociallink_set')

    class Meta:
        model = Profile
        fields = [
            'id', 'name', 'title', 'tagline', 'bio', 'career_goal',
            'email', 'location', 'avatar', 'resume', 'updated_at',
            'education', 'social_links'
        ]

