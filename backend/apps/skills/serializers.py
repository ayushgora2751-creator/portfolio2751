from rest_framework import serializers
from .models import SkillCategory, Skill

class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'category_name', 'icon_name', 'description', 'is_featured', 'order']

class SkillCategorySerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'slug', 'icon_name', 'description', 'order', 'skills']

