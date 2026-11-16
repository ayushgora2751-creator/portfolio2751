from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Profile, Education, SocialLink

class ProfileAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.profile = Profile.objects.create(
            name="Ayush Gora",
            title="Creative Developer",
            career_goal="Cloud & DevOps Engineer"
        )
        self.education = Education.objects.create(
            institution="GNA University, Phagwara",
            degree="B.Tech Computer Science Engineering",
            start_year=2025,
            end_year=2029
        )
        self.social = SocialLink.objects.create(
            platform="GitHub",
            url="https://github.com",
            icon_name="Github"
        )

    def test_get_profile(self):
        url = reverse('profile-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Ayush Gora")
        self.assertTrue(len(response.data['education']) >= 1)
        self.assertTrue(len(response.data['social_links']) >= 1)

    def test_get_education(self):
        url = reverse('education-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

