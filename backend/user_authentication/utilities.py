"""Utility helpers for token generation and email validation."""

import re
import hashlib, secrets
from datetime import timedelta
from django.utils import timezone

def make_email_token() -> tuple[str, str]:
    """Generate a secure random token and its SHA-256 hash.

    Returns:
        A tuple of (raw_token, token_hash) where raw_token is the URL-safe
        string to send to the user and token_hash is stored in the database.
    """
    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, token_hash

def token_expiry(hours: int = 24):
    """Calculate an expiry datetime relative to now.

    Args:
        hours: Number of hours until expiry. Defaults to 24.

    Returns:
        A timezone-aware datetime representing the expiry time.
    """
    return timezone.now() + timedelta(hours=hours)

def valid_case_email(email: str) -> bool:
    """Check whether an email address belongs to the case.edu domain.

    Args:
        email: The email address string to validate.

    Returns:
        True if the email matches the CWRU format, False otherwise.
    """
    return bool(re.search(r"^[A-Za-z0-9._%+-]+@case\.edu$", email))
