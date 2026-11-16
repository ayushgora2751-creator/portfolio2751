from django.urls import path
from .views import ProfileDetailView, SocialLinkListView

urlpatterns = [
    path('', ProfileDetailView.as_view(), name='profile-detail'),
    path('socials/', SocialLinkListView.as_view(), name='profile-socials'),
]

