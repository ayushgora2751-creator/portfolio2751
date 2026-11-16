from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Project
from .serializers import ProjectSerializer

class ProjectListView(generics.ListAPIView):
    """List all projects or filter by featured."""
    permission_classes = [AllowAny]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.all()
        featured_param = self.request.query_params.get('featured')
        if featured_param is not None:
            if featured_param.lower() in ('true', '1'):
                queryset = queryset.filter(featured=True)
            elif featured_param.lower() in ('false', '0'):
                queryset = queryset.filter(featured=False)
        return queryset

class ProjectDetailView(generics.RetrieveAPIView):
    """Retrieve detailed project record by ID or slug."""
    permission_classes = [AllowAny]
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'

