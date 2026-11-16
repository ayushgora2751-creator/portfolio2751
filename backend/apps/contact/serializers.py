import re
from rest_framework import serializers
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        if len(cleaned) > 150:
            raise serializers.ValidationError("Name cannot exceed 150 characters.")
        return cleaned

    def validate_email(self, value):
        cleaned = value.strip().lower()
        # Basic check for valid email pattern
        email_pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
        if not re.match(email_pattern, cleaned):
            raise serializers.ValidationError("Please provide a valid email address.")
        return cleaned

    def validate_subject(self, value):
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError("Subject must be at least 3 characters long.")
        return cleaned

    def validate_message(self, value):
        cleaned = value.strip()
        if len(cleaned) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return cleaned

