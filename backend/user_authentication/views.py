import hashlib
import json
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from . import utilities
from .models import EmailVerificationToken, PasswordResetToken

POST_LOGIN_PAGE_URL: str = "http://localhost:5173"


@csrf_exempt
def register_user(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))
    email = (json_body.get("email") or "").strip()
    password: str = json_body.get("password") or ""
    first_name: str = json_body.get("first_name") or ""
    last_name: str = json_body.get("last_name") or ""

    if not email or not utilities.valid_case_email(email):
        return HttpResponseBadRequest(b"Please enter a valid CWRU email")

    UserModel = get_user_model()

    try:
        validate_password(password)

        user = UserModel.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

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

    UserModel = get_user_model()

    try:
        u = UserModel.objects.get(username=email)
        if not u.is_active:
            return JsonResponse(
                {"success": False, "error": "Please verify your email before logging in."},
                status=403,
            )
    except UserModel.DoesNotExist:
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
        return JsonResponse({"success": True, "already_verified": True})

    if timezone.now() >= rec.expires_at:
        return JsonResponse({"success": False, "error": "Token expired"}, status=400)

    user = rec.user
    user.is_active = True
    user.save(update_fields=["is_active"])

    rec.used_at = timezone.now()
    rec.save(update_fields=["used_at"])

    return JsonResponse({"success": True})


@csrf_exempt
def forgot_password(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body = dict(json.loads(request.body))
    email = (json_body.get("email") or "").strip()

    UserModel = get_user_model()

    try:
        user = UserModel.objects.get(username=email)

        raw_token = secrets.token_urlsafe(16)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        PasswordResetToken.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(hours=1),
        )

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"

        send_mail(
            subject="Reset your Collabo password",
            message=f"Click this link to reset your password:\n\n{reset_link}\n\nThis link expires in 1 hour.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
    except UserModel.DoesNotExist:
        pass

    return JsonResponse({"success": True})


@csrf_exempt
def reset_password(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body = dict(json.loads(request.body))
    token = (json_body.get("token") or "").strip()
    new_password = json_body.get("password") or ""

    if not token:
        return JsonResponse({"success": False, "error": "Token required"}, status=400)

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    try:
        rec = PasswordResetToken.objects.select_related("user").get(token_hash=token_hash)
    except PasswordResetToken.DoesNotExist:
        return JsonResponse({"success": False, "error": "Invalid token"}, status=400)

    if rec.used_at is not None:
        return JsonResponse({"success": False, "error": "Token already used"}, status=400)

    if timezone.now() >= rec.expires_at:
        return JsonResponse({"success": False, "error": "Token expired"}, status=400)

    try:
        validate_password(new_password, user=rec.user)
    except ValidationError as e:
        return JsonResponse({"success": False, "error": list(e.messages)}, status=400)

    rec.user.set_password(new_password)
    rec.user.save()

    rec.used_at = timezone.now()
    rec.save(update_fields=["used_at"])

    return JsonResponse({"success": True})