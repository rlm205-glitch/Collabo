"""Database models for user accounts and authentication tokens."""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone


class CollaboUser(AbstractUser):
    """Custom user model extending Django's AbstractUser with CWRU-specific fields.

    Attributes:
        email: Unique CWRU email address used as the login identifier.
        major: The user's academic major.
        skills: JSON list of self-reported skills.
        interests: JSON list of personal/academic interests.
        availability: Free-text description of the user's weekly availability.
        preferred_contact_method: How the user prefers to be contacted.
        contact_information: Contact details (e.g. Discord handle, phone).
        active_project_notifications: Opt-in for new project notifications.
        project_expiration_notifications: Opt-in for expiration reminders.
        weekly_update_notifications: Opt-in for weekly digest emails.
    """

    email = models.EmailField(unique=True)
    major = models.TextField(max_length=50, help_text='Major', default="")
    skills = models.JSONField(default=list)
    interests = models.JSONField(default=list)
    availability = models.TextField(max_length=500, help_text='Availability', default="")
    preferred_contact_method = models.TextField(max_length=50, help_text='Preferred Contact Method', default="")
    contact_information = models.TextField(max_length=100, help_text='Contact Information', default="")
    active_project_notifications = models.BooleanField(default=True)
    project_expiration_notifications = models.BooleanField(default=True)
    weekly_update_notifications = models.BooleanField(default=True)

    def __str__(self) -> str:
        return self.email


class EmailVerificationToken(models.Model):
    """One-time token for verifying a new user's email address.

    Tokens are stored as SHA-256 hashes. The raw token is emailed to the
    user and never persisted directly.

    Attributes:
        user: The account this token belongs to.
        token_hash: SHA-256 hex digest of the raw token.
        expires_at: Datetime after which the token is no longer valid.
        used_at: Datetime the token was consumed; None if unused.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token_hash = models.CharField(max_length=64, unique=True)  # sha256 hex
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    def is_valid(self) -> bool:
        """Return True if the token has not been used and has not expired."""
        return self.used_at is None and timezone.now() < self.expires_at


class PasswordResetToken(models.Model):
    """One-time token for resetting a user's password.

    Attributes:
        user: The account requesting the reset.
        token_hash: SHA-256 hex digest of the raw token sent to the user.
        expires_at: Datetime after which the token is invalid (1 hour TTL).
        used_at: Datetime the token was consumed; None if unused.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
