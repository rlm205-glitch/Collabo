from .models import CollaboUser, EmailVerificationToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate, get_user_model
from django.core.validators import validate_email
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from . import utilities
import json
<<<<<<< HEAD
import hashlib
import secrets
=======
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from .models import EmailVerificationToken
import hashlib, secrets
>>>>>>> 352e71e (Add backend email verification)

POST_LOGIN_PAGE_URL: str = "http://localhost:5173"


@csrf_exempt
def register_user(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))
    email = json_body.get("email")
    password: str = json_body.get("password") or ""
    first_name: str = json_body.get("first_name") or ""
    last_name: str = json_body.get("last_name") or ""

    if not email or not utilities.valid_case_email(email):
        return HttpResponseBadRequest(b"Please enter a valid CWRU email")

    try:
        validate_password(password)
<<<<<<< HEAD
        validate_email(email)
        user = get_user_model().objects.create_user(email, email=email, password=password, first_name=first_name, last_name=last_name)
=======

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
>>>>>>> 352e71e (Add backend email verification)

        user.is_active = False
        user.save(update_fields=["is_active"])

        raw_token = secrets.token_urlsafe(16)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        EmailVerificationToken.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(hours=24),
        )

        verify_link = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"

        send_mail(
            subject="Verify your Collabo account",
            message=f"Click this link to verify your email:\n\n{verify_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

    except ValidationError:
        return HttpResponseBadRequest(b"Invalid password")
    except IntegrityError:
        return HttpResponseBadRequest(b"This email already has an account")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create user")

    return JsonResponse({"success": True, "redirect_url": POST_LOGIN_PAGE_URL})


@csrf_exempt
def login_user(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))
    email = (json_body.get("email") or "").strip()
    password: str = json_body.get("password") or ""

<<<<<<< HEAD
    try:
        username = CollaboUser.objects.get(email=email).username
    except Exception:
        return JsonResponse({"success": False, "error": "Invalid Login Credentials"}, status=400)

    try:
        u = CollaboUser.objects.get(username=username)
=======
    # If user exists but is inactive, give a specific error
    try:
        u = User.objects.get(username=email)
>>>>>>> 352e71e (Add backend email verification)
        if not u.is_active:
            return JsonResponse(
                {"success": False, "error": "Please verify your email before logging in."},
                status=403,
            )
<<<<<<< HEAD
    except CollaboUser.DoesNotExist:
        pass

    if (user := authenticate(request, username=username, password=password)) is not None:
        login(request, user)

        return JsonResponse({
            "success": True,
            "redirect_url": POST_LOGIN_PAGE_URL,
            "id": user.id, # pyright: ignore
            "first_name": user.first_name, # pyright: ignore
            "last_name": user.last_name, # pyright: ignore
            "username": user.username, # pyright: ignore
            "email": user.email, # pyright: ignore
            "major": user.major, # pyright: ignore
            "skills": user.skills, # pyright: ignore
            "interests": user.interests, # pyright: ignore
            "availability": user.availability, # pyright: ignore
            "preferred_contact_method": user.preferred_contact_method, # pyright: ignore
            "active_project_notifications": user.active_project_notifications, # pyright: ignore
            "project_expiration_notifications": user.project_expiration_notifications, # pyright: ignore
            "weekly_update_notifications": user.weekly_update_notifications, # pyright: ignore
            "is_staff": user.is_staff
        })

    return JsonResponse(
        {"success": False, "error": "Invalid Login Credentials"}, status=400
    )

=======
    except User.DoesNotExist:
        pass

    if (user := authenticate(request, username=email, password=password)) is not None:
        login(request, user)

        send_mail(
            subject="New Login to Your Collabo Account",
            message="You have successfully logged in to your Collabo account.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        return JsonResponse({"success": True, "redirect_url": POST_LOGIN_PAGE_URL})
    return JsonResponse({"success": False, "error": "Invalid Login Credentials"}, status=400)

  
>>>>>>> 352e71e (Add backend email verification)

@csrf_exempt
def verify_email(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body = dict(json.loads(request.body))
    token = (json_body.get("token") or "").strip()
    if not token:
        return JsonResponse({"success": False, "error": "Token required"}, status=400)

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    try:
        rec = EmailVerificationToken.objects.select_related("user").get(token_hash=token_hash)
    except EmailVerificationToken.DoesNotExist:
        return JsonResponse({"success": False, "error": "Invalid token"}, status=400)

    if rec.used_at is not None:
        return JsonResponse({"success": False, "error": "Token already used"}, status=400)

    if timezone.now() >= rec.expires_at:
        return JsonResponse({"success": False, "error": "Token expired"}, status=400)

    user = rec.user
    user.is_active = True
    user.save(update_fields=["is_active"])

    rec.used_at = timezone.now()
    rec.save(update_fields=["used_at"])

    return JsonResponse({"success": True})
