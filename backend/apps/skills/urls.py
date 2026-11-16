from django.urls import path
from .views import SkillListView, FlatSkillListView

urlpatterns = [
    path('', SkillListView.as_view(), name='skill-categories'),
    path('flat/', FlatSkillListView.as_view(), name='skill-flat-list'),
]

