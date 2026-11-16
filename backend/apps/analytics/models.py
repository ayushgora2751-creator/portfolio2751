from django.db import models

class Achievement(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(
        max_length=100,
        default="Academic",
        help_text="e.g. Academic, Cloud, Competition, Open Source"
    )
    issuer = models.CharField(max_length=150, default="GNA University")
    date_achieved = models.CharField(max_length=50, default="2025")
    description = models.TextField(blank=True)
    credential_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-id']

    def __str__(self):
        return f"{self.title} ({self.issuer})"


class PageEvent(models.Model):
    EVENT_CHOICES = [
        ('page_view', 'Page View'),
        ('resume_download', 'Resume Download'),
        ('project_click', 'Project Link Click'),
        ('swarm_interaction', 'Swarm Cursor Interaction'),
    ]
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES, default='page_view')
    path = models.CharField(max_length=255, default='/')
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} at {self.created_at}"

