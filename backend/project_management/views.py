from codecs import ignore_errors
from ctypes import cast
import json
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.contrib.auth.models import AnonymousUser, User
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

    if not request.user.is_authenticated:
        return HttpResponseBadRequest(b"Couldn't Validate Account")


    try:
        project = Project.objects.create(
            title=json_body.get("title", ""),
            short_description=json_body.get("short_description", ""),
            author=request.user.get_username(),
            extended_description=json_body.get("extended_description", ""),

            preferred_skills=json_body.get("preferred_skills", ""),
            project_type=json_body.get("project_type"),
            workload_per_week=json_body.get("workload_per_week"),
            preferred_contact_method=json_body.get("preferred_contact_method"),
            contact_information=json_body.get("contact_information"),
        )

        project.members.add(request.user) # type: ignore_errors
    except IntegrityError:
        return HttpResponseBadRequest(b"This project has been created already")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create project")

    return JsonResponse({"success": True, "project_id": project.id, "redirect_url": HOME_PAGE_URL})

@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def join_project(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.get(
            id=json_body.get("project_id", "")
        )

        project.members.add(request.user) # type: ignore_errors
    except Exception:
        return HttpResponseBadRequest(b"Failed to join project")

    return JsonResponse({"success": True, "redirect_url": HOME_PAGE_URL})
