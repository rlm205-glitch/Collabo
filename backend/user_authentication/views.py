from .models import CollaboUser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.core.validators import validate_email
from . import utilities
import json

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
        validate_email(email)
        _ = get_user_model().objects.create_user(email, email=email, password=password, first_name=first_name, last_name=last_name)
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
    email = json_body.get("email") or ""
    password: str = json_body.get("password") or ""

    try:
        username = CollaboUser.objects.get(
            email=email
        ).username
    except Exception:
        return JsonResponse({"success": False, "error": "Invalid Logic Credentials"}, status=400)

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


@csrf_exempt
def whoami(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        user = request.user
        return JsonResponse({
            "success": True,
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
    return JsonResponse({"success": False}, status=401)


@csrf_exempt
def logout_user(request: HttpRequest) -> HttpResponse:
    logout(request)
    return JsonResponse({"success": True})
