from django.db import models

class Profile(models.Model):
    name = models.CharField(max_length=120, default="Ayush Gora")
    title = models.CharField(max_length=200, default="Creative Developer | Cloud & DevOps Enthusiast")
    tagline = models.CharField(
        max_length=300,
        default="I build digital experiences and explore the future of technology."
    )
    bio = models.TextField(
        default=(
            "I'm Ayush Gora, a Computer Science Engineering student at GNA University, Phagwara. "
            "I'm passionate about software development, cloud computing, modern web technologies, "
            "and building innovative digital experiences. I enjoy experimenting with new technologies, "
            "creating interactive applications, and learning how modern cloud infrastructure works."
        )
    )
    career_goal = models.CharField(
        max_length=255,
        default="Become a skilled Cloud and DevOps Engineer."
    )
    email = models.EmailField(default="ayushgora@example.com")
    location = models.CharField(max_length=120, default="Phagwara, Punjab, India")
    avatar = models.ImageField(upload_to="profile/", blank=True, null=True)
    resume = models.FileField(upload_to="resume/", blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Developer Profile"
        verbose_name_plural = "Developer Profile"

    def __str__(self):
        return f"{self.name} - {self.title}"


class Education(models.Model):
    institution = models.CharField(max_length=200, default="GNA University, Phagwara")
    degree = models.CharField(max_length=150, default="B.Tech Computer Science Engineering")
    field_of_study = models.CharField(max_length=150, default="Computer Science & Engineering")
    start_year = models.IntegerField(default=2025)
    end_year = models.IntegerField(default=2029)
    is_current = models.BooleanField(default=True)
    description = models.TextField(
        blank=True,
        default="Focusing on distributed systems, modern web architectures, cloud computing, and DevOps engineering principles."
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_year']
        verbose_name = "Education"
        verbose_name_plural = "Education Records"

    def __str__(self):
        return f"{self.degree} at {self.institution} ({self.start_year}-{self.end_year})"


class SocialLink(models.Model):
    platform = models.CharField(max_length=50) # e.g. GitHub, LinkedIn, Twitter, Email
    url = models.URLField()
    icon_name = models.CharField(max_length=50, default="ExternalLink")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'platform']

    def __str__(self):
        return f"{self.platform} ({self.url})"

