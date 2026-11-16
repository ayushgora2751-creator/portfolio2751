from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import ContactMessage

class ContactAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('contact-submit')

    def test_valid_contact_submission(self):
        payload = {
            "name": "Jane Developer",
            "email": "jane@techcorp.io",
            "subject": "Opportunity Inquiry",
            "message": "Hi Ayush, we love your 3D portfolio and would like to discuss a project."
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
        msg = ContactMessage.objects.first()
        self.assertEqual(msg.name, "Jane Developer")
        self.assertEqual(msg.email, "jane@techcorp.io")

    def test_invalid_email_submission(self):
        payload = {
            "name": "Jane",
            "email": "invalid-email-address",
            "subject": "Hello",
            "message": "Testing invalid email input."
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_short_message_validation(self):
        payload = {
            "name": "Bob",
            "email": "bob@example.com",
            "subject": "Hi",
            "message": "Short" # Less than 10 characters
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data['errors'])

