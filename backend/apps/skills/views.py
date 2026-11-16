from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import SkillCategory, Skill
from .serializers import SkillCategorySerializer, SkillSerializer

class SkillListView(generics.ListAPIView):
    """List all skill categories with nested skills."""
    permission_classes = [AllowAny]
    queryset = SkillCategory.objects.prefetch_related('skills').all()
    serializer_class = SkillCategorySerializer

class FlatSkillListView(generics.ListAPIView):
    """List flat list of skills."""
    permission_classes = [AllowAny]
    queryset = Skill.objects.select_related('category').all()
    serializer_class = SkillSerializer

