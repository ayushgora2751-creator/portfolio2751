from django.db import models

class SkillCategory(models.Model):
    name = models.CharField(max_length=100) # e.g. Frontend, Backend, Cloud & DevOps, Core Tools
    slug = models.SlugField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default="Code")
    description = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = "Skill Categories"

    def __str__(self):
        return self.name


class Skill(models.Model):
    name = models.CharField(max_length=100) # e.g. React, Three.js, Python, Django, AWS EC2, Docker
    category = models.ForeignKey(SkillCategory, related_name='skills', on_delete=models.CASCADE)
    icon_name = models.CharField(max_length=50, default="Cpu")
    description = models.CharField(max_length=255, blank=True)
    is_featured = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.category.name})"

