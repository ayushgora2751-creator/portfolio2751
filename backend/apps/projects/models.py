from django.db import models

class Project(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    short_description = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(
        max_length=100,
        default="Full-Stack Web",
        help_text="e.g. Full-Stack Web, Real-Time Game, 3D Interactive, Client Solution"
    )
    technologies = models.JSONField(
        default=list,
        help_text="List of technologies, e.g. ['React', 'Django', 'Three.js']"
    )
    image = models.ImageField(upload_to="projects/", blank=True, null=True)
    thumbnail_url = models.URLField(
        blank=True,
        help_text="Fallback image URL or hosted thumbnail"
    )
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    featured = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

