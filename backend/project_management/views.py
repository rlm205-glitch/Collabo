"""Views for project CRUD, join requests, reports, and admin moderation."""

import json
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.forms.models import model_to_dict
from django.db import IntegrityError, transaction
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse, HttpResponseForbidden
from django.contrib.auth.models import AnonymousUser, User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .decorators import staff_required

from .join_request import create_join_request, get_notification_recipients, send_join_request_email, \
    send_join_decision_email
from .models import Project, Join_Request, Report
from django.core.mail import send_mail

LOGIN_PAGE_URL: str = "http://localhost:5173/login"
HOME_PAGE_URL: str = "http://localhost:5173/home"


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def create_project(request: HttpRequest) -> HttpResponse:
    """Create a new project and add the creator as its first member.

    Expects a POST request with a JSON body containing project fields.

    Args:
        request: The incoming HTTP request with project data in the body.

    Returns:
        JsonResponse with success status and the new project id.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    if not request.user.is_authenticated:
        return HttpResponseBadRequest(b"Couldn't Validate Account")

    try:
        project = Project.objects.create(
            title=json_body.get("title", ""),
            short_description=json_body.get("short_description", ""),
            author=request.user.username,
            author_id=request.user.id,
            extended_description=json_body.get("extended_description", ""),

            preferred_skills=json_body.get("preferred_skills", []),
            project_type=json_body.get("project_type"),
            workload_per_week=json_body.get("workload_per_week"),
            preferred_contact_method=json_body.get("preferred_contact_method"),
            contact_information=json_body.get("contact_information"),
        )

        project.members.add(request.user)  # type: ignore_errors

    except IntegrityError:
        return HttpResponseBadRequest(b"This project has been created already")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create project")

    return JsonResponse({"success": True, "id": project.id, "redirect_url": HOME_PAGE_URL})


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def join_project(request: HttpRequest) -> HttpResponse:
    """Submit a join request for an existing project.

    If the user is already a member the call succeeds silently. Otherwise a
    pending Join_Request is created and project members are emailed.

    Args:
        request: POST request with JSON body containing project_id and
            an optional message string.

    Returns:
        JsonResponse indicating success or a bad-request error.
    """
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

        if project.members.filter(id=request.user.id).exists():
            return JsonResponse({"success": True, "redirect_url": HOME_PAGE_URL})

        join_request, created = create_join_request(project, request.user, message)
        if created:
            recipients = get_notification_recipients(project, request.user)
            send_join_request_email(project, request.user, message, recipients)

        return JsonResponse({"success": True, "redirect_url": HOME_PAGE_URL})
    except Project.DoesNotExist:
        return HttpResponseBadRequest(b"Project not found")
    except Exception as e:
        return HttpResponseBadRequest(str(e).encode())


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def list_projects(request: HttpRequest) -> HttpResponse:
    """Return a condensed list of all projects, with optional filtering and sorting.

    Args:
        request: POST request with optional JSON body fields:
            sortkey (str): Field name to sort by (default 'title').
            filters (dict or list): Django ORM filter kwargs to apply.

    Returns:
        JsonResponse with condensed_projects list and project_count.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        sortkey = json_body.get("sortkey", "title")
        projects = Project.objects.prefetch_related('members').order_by(sortkey, "author")

        filters = json_body.get("filters", [])

        if filters:
            if isinstance(filters, dict):
                projects = projects.filter(**filters)
            elif isinstance(filters, list):
                for filter_item in filters:
                    if isinstance(filter_item, dict):
                        projects = projects.filter(**filter_item)

        condensed_project_data = [
            {
                "id": p.id,
                "title": p.title,
                "short_description": p.short_description,
                "author": p.author,
                "author_id": p.author_id,
                "project_type": p.project_type,
                "workload_per_week": p.workload_per_week,
                "preferred_skills": p.preferred_skills,
                "member_ids": [m.id for m in p.members.all()],
                "creation_time": p.creation_time,
            }
            for p in projects
        ]

        return JsonResponse({"success": True,
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
    """Return full details for a single project by id.

    Args:
        request: POST request with JSON body containing id (int).

    Returns:
        JsonResponse with a project dict including author name fields and
        current member ids.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.get(
            id=json_body.get("id", "")
        )

        from django.contrib.auth import get_user_model
        author_first_name, author_last_name = "", ""
        try:
            author_user = get_user_model().objects.get(id=project.author_id)
            author_first_name = author_user.first_name
            author_last_name = author_user.last_name
        except Exception:
            pass

        project_data = {
            "id": project.id,
            "title": project.title,
            "short_description": project.short_description,
            "author": project.author,
            "author_id": project.author_id,
            "author_first_name": author_first_name,
            "author_last_name": author_last_name,
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
    """Delete a project owned by the current user.

    Only the project's original author may delete it.

    Args:
        request: POST request with JSON body containing id (int).

    Returns:
        JsonResponse indicating success or an error message.
    """
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
    """Submit a moderation report against a project.

    Each user may only report a given project once.

    Args:
        request: POST request with JSON body containing project_id, reason,
            and an optional description string.

    Returns:
        JsonResponse with the new report id on success.
    """
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
    """Return all moderation reports, optionally filtered by project. Staff only.

    Args:
        request: POST request with optional JSON body field project_id (int).

    Returns:
        JsonResponse with a reports list and report_count.
    """
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
    """Delete any project regardless of ownership. Staff only.

    Args:
        request: POST request with JSON body containing id (int).

    Returns:
        JsonResponse indicating success or a not-found error.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        project = Project.objects.get(id=json_body.get("id", ""))
        project.delete()
        return JsonResponse({"success": True})
    except Project.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def update_project(request: HttpRequest) -> HttpResponse:
    """Update editable fields on an existing project.

    Only the project's author may perform updates.

    Args:
        request: POST request with JSON body containing id (int) and any
            subset of the editable fields.

    Returns:
        JsonResponse indicating success, or a 403/404 on failure.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    body = json.loads(request.body)
    project_id = body.get("id")

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)

    if project.author != request.user.get_username():
        return HttpResponseForbidden(b"Permission denied")

    fields = ["title", "short_description", "extended_description", "project_type",
              "preferred_skills", "workload_per_week", "preferred_contact_method", "contact_information"]
    for field in fields:
        if field in body:
            setattr(project, field, body[field])

    project.save()
    return JsonResponse({"success": True})


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def list_join_requests(request: HttpRequest) -> HttpResponse:
    """Return all pending join requests for a project.

    Only current members of the project may view requests.

    Args:
        request: POST request with JSON body containing project_id (int).

    Returns:
        JsonResponse with a data list of pending join request dicts.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    body = json.loads(request.body)
    project_id = body.get("project_id")
    if not project_id:
        return HttpResponseBadRequest(b"Missing project id")
    project = Project.objects.get(id=project_id)

    if not project.members.filter(id=request.user.id).exists():
        return HttpResponseForbidden(b"Permission denied")

    qs = Join_Request.objects.filter(project=project, status="pending").select_related("requester")

    data = [
        {
            "id": jr.id,
            "requester_id": jr.requester.id,
            "requester_username": jr.requester.username,
            "requester_first_name": jr.requester.first_name,
            "requester_last_name": jr.requester.last_name,
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
    """Approve or reject a pending join request.

    Only current project members may decide. Approving atomically adds the
    requester to the project's member set and sends a notification email.

    Args:
        request: POST request with JSON body containing join_request_id (int),
            decision ('approved' or 'rejected'), and optional reply_message.

    Returns:
        JsonResponse with the resulting status string.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    try:
        body = json.loads(request.body)
        join_request_id = body.get("join_request_id")
        decision = body.get("decision")
        reply_message = body.get("reply_message")

        if not join_request_id or decision not in ("approved", "rejected"):
            return HttpResponseBadRequest(b"Invalid request id or decision")

        jr = Join_Request.objects.select_related("project", "requester").get(id=join_request_id)
        project = jr.project

        if not project.members.filter(id=request.user.id).exists():
            return HttpResponseForbidden(b"Permission denied")

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
def am_i_member(request: HttpRequest) -> HttpResponse:
    """Check whether the current user is a member of a given project.

    Args:
        request: POST request with JSON body containing project_id (int).

    Returns:
        JsonResponse with is_member boolean.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    try:
        body = json.loads(request.body)
        project_id = body.get("project_id")
        if not project_id:
            return HttpResponseBadRequest(b"Missing project_id")
        project = Project.objects.get(id=project_id)
        is_member = project.members.filter(id=request.user.id).exists()
        return JsonResponse({"success": True, "is_member": is_member})
    except Project.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)
    except Exception as e:
        return HttpResponseBadRequest(str(e).encode())


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def get_members(request: HttpRequest) -> HttpResponse:
    """Return the list of member user ids for a given project.

    Args:
        request: POST request with JSON body containing project_id (int).

    Returns:
        JsonResponse with member_ids list.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    try:
        body = json.loads(request.body)
        project_id = body.get("project_id")
        if not project_id:
            return HttpResponseBadRequest(b"Missing project_id")
        project = Project.objects.get(id=project_id)
        member_ids = list(project.members.values_list("id", flat=True))
        return JsonResponse({"success": True, "member_ids": member_ids})
    except Project.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)
    except Exception as e:
        return HttpResponseBadRequest(str(e).encode())
