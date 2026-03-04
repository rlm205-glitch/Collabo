import re
import hashlib, secrets
from datetime import timedelta
from django.utils import timezone

def make_email_token():
    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, token_hash

def token_expiry(hours=24):
    return timezone.now() + timedelta(hours=hours)

def valid_case_email(email: str) -> bool:
    return bool(re.search(r"^[A-Za-z0-9._%+-]+@case\.edu$", email))
