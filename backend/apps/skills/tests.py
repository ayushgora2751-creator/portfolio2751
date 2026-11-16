from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import SkillCategory, Skill

class SkillsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat1 = SkillCategory.objects.create(
            name="Frontend",
            slug="frontend",
            order=1
        )
        self.skill1 = Skill.objects.create(
            category=self.cat1,
            name="React",
            order=1
        )
        self.skill2 = Skill.objects.create(
            category=self.cat1,
            name="Three.js",
            order=2
        )

    def test_list_skill_categories(self):
        url = reverse('skill-categories')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(len(response.data[0]['skills']), 2)

    def test_list_flat_skills(self):
        url = reverse('skill-flat-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

