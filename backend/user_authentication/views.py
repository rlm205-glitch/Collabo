from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate
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

    if not email or not utilities.valid_case_email(email):
        return HttpResponseBadRequest(b"Please enter a valid CWRU email")

    try:
        validate_password(password)
        _ = User.objects.create_user(email, email=email, password=password)
    except ValidationError:
        return HttpResponseBadRequest(b"Invalid password")
    except IntegrityError:
        return HttpResponseBadRequest(b"This email already has an account")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create user")

    return JsonResponse({"success": True, "redirect_url": POST_LOGIN_PAGE_URL})


@csrf_exempt
def login_user(request: HttpRequest) -> HttpResponse:
    print(f"Django Received the following request:\n- {request}")
    print(f"{request.body}")

    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))
    email = json_body.get("email") or ""
    password: str = json_body.get("password") or ""

    if (user := authenticate(request, username=email, password=password)) is not None:
        login(request, user)
        return JsonResponse({"success": True, "redirect_url": POST_LOGIN_PAGE_URL})

    return JsonResponse(
        {"success": False, "error": "Invalid Login Credentials"}, status=400
    )
