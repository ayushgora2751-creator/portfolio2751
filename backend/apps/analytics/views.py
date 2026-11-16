from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Achievement, PageEvent
from .serializers import AchievementSerializer

class AchievementListView(generics.ListAPIView):
    """List achievements and academic honors."""
    permission_classes = [AllowAny]
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer

class TrackEventView(APIView):
    """Anonymous telemetry endpoint for user interaction metrics."""
    permission_classes = [AllowAny]

    def post(self, request):
        event_type = request.data.get('event_type', 'page_view')
        path = request.data.get('path', '/')

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        user_agent = request.META.get('HTTP_USER_AGENT', '')

        PageEvent.objects.create(
            event_type=event_type,
            path=path,
            ip_address=ip,
            user_agent=user_agent
        )

        return Response({"status": "recorded"}, status=status.HTTP_201_CREATED)

