from codecs import ignore_errors
from ctypes import cast
import json
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.forms.models import model_to_dict
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.contrib.auth.models import AnonymousUser, User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from .models import Project, Report
from .decorators import staff_required

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

            preferred_skills=json_body.get("preferred_skills", []),
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

    return JsonResponse({"success": True, "id": project.id, "redirect_url": HOME_PAGE_URL})

@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def join_project(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.get(
            id=json_body.get("id", "")
        )

        project.members.add(request.user) # type: ignore_errors
    except Exception:
        return JsonResponse({"success": False, "error": "Failed to join project"})

    return JsonResponse({"success": True, "redirect_url": HOME_PAGE_URL})

@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def list_projects(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        sortkey = json_body.get("sortkey", "title")
        projects = Project.objects.order_by(sortkey, "author")

        filters = json_body.get("filters", [])

        if filters:
            if isinstance(filters, dict):
                projects = projects.filter(**filters)
            elif isinstance(filters, list):
                for filter_item in filters:
                    if isinstance(filter_item, dict):
                        projects = projects.filter(**filter_item)
        condensed_project_data = list(projects.values("id", "title", "short_description", "author", "project_type", "workload_per_week", "preferred_skills"))

        return JsonResponse({ "success": True,
            "condensed_projects": condensed_project_data,
            "project_count": len(condensed_project_data)
        })

    except Exception as e:
        return JsonResponse({
            "success": False,
            "error": f"Failed to retrieve projects: {str(e)}"
        })
    
@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def get_project(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.get(
            id=json_body.get("id", "")
        )

        project_data = {
            "id": project.id,
            "title": project.title,
            "short_description": project.short_description,
            "author": project.author,
            "extended_description": project.extended_description,
            "preferred_skills": project.preferred_skills,
            "project_type": project.project_type,
            "workload_per_week": project.workload_per_week,
            "preferred_contact_method": project.preferred_contact_method,
            "contact_information": project.contact_information,
            "creation_time": project.creation_time,
            "updated_time": project.updated_time,
            "members": [user.id for user in project.members.all()]
        }

        return JsonResponse({"success": True, "project": project_data})
    except Exception:
        return JsonResponse({"success": False, "error": "Failed to get project"})

@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def delete_project(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.get(
            id=json_body.get("id", "")
        )

        if project.author == request.user.get_username():
            project.delete()
        else:
            return JsonResponse({"success": False, "error": "Cannot delete a project that you did not create"})

        return JsonResponse({"success": True})
    except Exception:
        return JsonResponse({"success": False, "error": "Failed to delete project"})


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def report_project(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    project_id = json_body.get("project_id")
    reason = json_body.get("reason", "")
    description = json_body.get("description", "")

    valid_reasons = [choice[0] for choice in Report.REASON_CHOICES]
    if reason not in valid_reasons:
        return JsonResponse({"success": False, "error": "Invalid reason category"}, status=400)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)

    if Report.objects.filter(project=project, reporter=request.user).exists():
        return JsonResponse({"success": False, "error": "You have already reported this project"}, status=400)

    report = Report.objects.create(
        project=project,
        reporter=request.user,
        reason=reason,
        description=description,
    )

    return JsonResponse({"success": True, "report_id": report.id})


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
@staff_required
def list_reports(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    project_id = json_body.get("project_id")

    reports = Report.objects.select_related("project", "reporter").order_by("-created_at")

    if project_id:
        reports = reports.filter(project_id=project_id)

    reports_data = [
        {
            "id": report.id,
            "project_id": report.project.id,
            "project_title": report.project.title,
            "reporter_username": report.reporter.username,
            "reason": report.reason,
            "description": report.description,
            "created_at": report.created_at.isoformat(),
        }
        for report in reports
    ]

    return JsonResponse({
        "success": True,
        "reports": reports_data,
        "report_count": len(reports_data),
    })


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
@staff_required
def admin_delete_project(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.get(id=json_body.get("id", ""))
        project.delete()
        return JsonResponse({"success": True})
    except Project.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)
