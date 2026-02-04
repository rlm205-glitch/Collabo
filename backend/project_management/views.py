import json
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from .models import Project

LOGIN_PAGE_URL: str = "http://localhost:5173/login"
HOME_PAGE_URL: str = "http://localhost:5173/home"

@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def create_project(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.create(
            title=json_body.get("title", ""),
            subtitle=json_body.get("subtitle", ""),
            author=json_body.get("author", ""),
            description=json_body.get("description", ""),
            preferred_skills=json_body.get("preferred_skills", ""),
        )

        project.members.add(request.user)
    except IntegrityError:
        return HttpResponseBadRequest(b"This project has been created already")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create project")

    return JsonResponse({"success": True, "redirect_url": HOME_PAGE_URL})
