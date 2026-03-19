from codecs import ignore_errors
from ctypes import cast
import json
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.forms.models import model_to_dict
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.db import IntegrityError, transaction
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse, HttpResponseForbidden
from django.contrib.auth.models import AnonymousUser, User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.shortcuts import render

from .join_request import create_join_request, get_notification_recipients, send_join_request_email, \
    send_join_decision_email
from .models import Project, Join_Request
from django.core.mail import send_mail

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

            project_type=json_body.get("project_type"),
            workload_per_week=json_body.get("workload_per_week"),
            preferred_contact_method=json_body.get("preferred_contact_method"),
            contact_information=json_body.get("contact_information"),
        )

        project.members.add(request.user) # type: ignore_errors

        for skill in json_body.get("preferred_skills", []):
            project.preferred_skills.append(skill)

    except IntegrityError:
        return HttpResponseBadRequest(b"This project has been created already")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create project")

    return JsonResponse({"success": True, "id": project.id, "redirect_url": HOME_PAGE_URL})

@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def join_project(request: HttpRequest) -> HttpResponse:
    """Should log a request without automatically adding the user, project members must accept it."""
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    if not request.user.is_authenticated:
        return HttpResponseBadRequest(b"Authentication required")

    try:
        body = json.loads(request.body)
        project_id = body.get("project_id")
        message = body.get("message", "")

        if not project_id:
            return HttpResponseBadRequest(b"Missing project id")
        project = Project.objects.get(id=project_id)

        #if member already do nothing
        if project.members.filter(id=request.user.id).exists():
            return JsonResponse({"success": True, "redirect_url": HOME_PAGE_URL})

        join_request, created = create_join_request(project, request.user, message)
        if created:
            recipients = get_notification_recipients(project, request.user)
            print("recipients: ", recipients)
            send_join_request_email(project, request.user, message, recipients)

        return JsonResponse({"success": True, "redirect_url": HOME_PAGE_URL})
    except Project.DoesNotExist:
        return HttpResponseBadRequest(b"Project not found")
    except Exception as e:
        return HttpResponseBadRequest(str(e).encode())

"""Implement accept/reject functions"""
@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def list_join_requests(request: HttpRequest) -> HttpResponse:
    if request.method != "POST": #or GET if we don't want changes
        return HttpResponseBadRequest(b"HTTP method must be POST")

    body = json.loads(request.body)
    project_id = body.get("project_id")
    if not project_id:
        return HttpResponseBadRequest(b"Missing project id")
    project = Project.objects.get(id=project_id)

    #Right now, only members can view. Could restrict to owner later
    if not project.members.filter(id=request.user.id).exists():
        return HttpResponseForbidden(b"Permission denied")

    qs = Join_Request.objects.filter(project=project, status="pending").select_related("requester")

    data = [
        {
            "id": jr.id,
            "requester_username": jr.requester.username,
            "requester_email": jr.requester.email,
            "message": jr.message,
            "created_at": jr.created_at.isoformat(),
            "status": jr.status,
        }
        for jr in qs
    ]
    return JsonResponse({"success": True, "data": data})

@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def decide_join_request(request: HttpRequest) -> HttpResponse:
    if request.method != "POST": return HttpResponseBadRequest(b"HTTP method must be POST")

    try:
        body = json.loads(request.body)
        join_request_id = body.get("join_request_id")
        decision = body.get("decision")#approved or rejected for the frontend
        reply_message = body.get("reply_message")

        if not join_request_id or decision not in ("approved", "rejected"):
            return HttpResponseBadRequest(b"Invalid request id or decision")

        jr = Join_Request.objects.select_related("project", "requester").get(id=join_request_id)
        project = jr.project

        #project members can decide
        if not project.members.filter(id=request.user.id).exists():
            return HttpResponseForbidden(b"Permission denied")

        #only decide pending requests
        if jr.status != "pending":
            return JsonResponse({"success": True, "status": jr.status})

        if decision == "approved":
            with transaction.atomic():
                project.members.add(jr.requester)
                jr.status = "approved"
                jr.save(update_fields=["status"])
            send_join_decision_email(project, jr.requester, "approved", reply_message)
            return JsonResponse({"success": True, "status": "approved"})
        else:
            jr.status = "rejected"
            jr.save(update_fields=["status"])

            send_join_decision_email(project, jr.requester, "rejected", reply_message)
            return JsonResponse({"success": True, "status": "rejected"})
    except Join_Request.DoesNotExist:
        return HttpResponseBadRequest(b"Join Request not found")
    except Project.DoesNotExist:
        return HttpResponseBadRequest(b"Project not found")
    except Exception as e:
        return HttpResponseBadRequest(str(e).encode())


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
        condensed_project_data = list(projects.values("id", "title", "short_description", "author", "project_type", "preferred_skills"))

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
            "members": [user.id for user in project.members.all()]
        }

        return JsonResponse({"success": True, "project": project_data})
    except Exception:
        return JsonResponse({"success": False, "error": "Failed to get project"})



