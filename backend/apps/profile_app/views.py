from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Profile, Education, SocialLink
from .serializers import ProfileSerializer, EducationSerializer, SocialLinkSerializer

class ProfileDetailView(APIView):
    """Retrieve the primary developer profile for Ayush Gora."""
    permission_classes = [AllowAny]

    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            # Create default profile if none exists
            profile = Profile.objects.create()
        serializer = ProfileSerializer(profile, context={'request': request})
        data = serializer.data
        # Attach education and active social links
        data['education'] = EducationSerializer(Education.objects.all(), many=True).data
        data['social_links'] = SocialLinkSerializer(SocialLink.objects.filter(is_active=True), many=True).data
        return Response(data)


class EducationListView(generics.ListAPIView):
    """List education timeline items."""
    permission_classes = [AllowAny]
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class SocialLinkListView(generics.ListAPIView):
    """List active verified social links."""
    permission_classes = [AllowAny]
    queryset = SocialLink.objects.filter(is_active=True)
    serializer_class = SocialLinkSerializer

