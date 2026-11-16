from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Project

class ProjectAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project1 = Project.objects.create(
            title="Bingo Multiplayer Game",
            slug="bingo-multiplayer-game",
            short_description="Multiplayer game",
            description="Real-time gameplay",
            category="Real-Time Game",
            technologies=["React", "Django"],
            featured=True,
            order=1
        )
        self.project2 = Project.objects.create(
            title="SamajSeva",
            slug="samajseva",
            short_description="Social impact",
            description="Volunteer web app",
            category="Social Impact Web App",
            technologies=["Python", "Django"],
            featured=False,
            order=2
        )

    def test_list_all_projects(self):
        url = reverse('project-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_featured_projects(self):
        url = reverse('project-list')
        response = self.client.get(url, {'featured': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Bingo Multiplayer Game")

    def test_retrieve_project_detail(self):
        url = reverse('project-detail', kwargs={'id': self.project1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Bingo Multiplayer Game")

