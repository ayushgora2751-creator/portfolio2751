from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for deployments and monitoring."""
    return Response({
        "status": "healthy",
        "service": "Ayush Gora Portfolio API",
        "version": "1.0.0",
        "environment": "development" if settings.DEBUG else "production"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/profile/', include('apps.profile_app.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/skills/', include('apps.skills.urls')),
    path('api/contact/', include('apps.contact.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    # Direct alias for education and achievements
    path('api/education/', include('apps.profile_app.urls_education')),
    path('api/achievements/', include('apps.analytics.urls_achievements')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

