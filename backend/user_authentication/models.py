from django.db import models
<<<<<<< HEAD
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone

class CollaboUser(AbstractUser):
    email = models.EmailField(unique=True)
    major = models.TextField(max_length=50, help_text='Major', default="")
    skills = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    availability =  models.TextField(max_length=500, help_text='Availability', default="")
    preferred_contact_method = models.TextField(max_length=50, help_text='Preferred Contact Method', default="")
    contact_information = models.TextField(max_length=100, help_text='Contact Information', default="")
    active_project_notifications = models.BooleanField(default=True)
    project_expiration_notifications = models.BooleanField(default=True)
    weekly_update_notifications = models.BooleanField(default=True)

    def __str__(self):
        return self.email


=======
from django.conf import settings
from django.utils import timezone

>>>>>>> 352e71e (Add backend email verification)
class EmailVerificationToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token_hash = models.CharField(max_length=64, unique=True)  # sha256 hex
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    def is_valid(self):
        return self.used_at is None and timezone.now() < self.expires_at
