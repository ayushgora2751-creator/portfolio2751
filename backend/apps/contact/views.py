from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer

class ContactRateThrottle(ScopedRateThrottle):
    scope = 'contact'

class ContactCreateView(APIView):
    """
    Accept contact messages from portfolio visitors.
    Protected with rate-limiting and input validation.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            # Extract client IP address for abuse tracking
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR')

            contact_msg = serializer.save(ip_address=ip)

            # Optional notification dispatch (safe fallback)
            try:
                subject = f"New Portfolio Inquiry from {contact_msg.name}: {contact_msg.subject}"
                body = (
                    f"Name: {contact_msg.name}\n"
                    f"Email: {contact_msg.email}\n"
                    f"Subject: {contact_msg.subject}\n\n"
                    f"Message:\n{contact_msg.message}\n"
                )
                recipient = getattr(settings, 'EMAIL_HOST_USER', 'ayushgora@example.com')
                if recipient:
                    send_mail(
                        subject,
                        body,
                        settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'no-reply@ayushgora.dev',
                        [recipient],
                        fail_silently=True,
                    )
            except Exception:
                pass # Non-blocking

            return Response({
                "status": "success",
                "message": "Thank you for reaching out! Your message has been received.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "status": "error",
            "message": "Please correct the errors in the form.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

