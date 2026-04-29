"""Views for reading and updating user profile data."""

import json
from typing import Any
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from project_management.views import HOME_PAGE_URL, LOGIN_PAGE_URL
from user_authentication.models import CollaboUser


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def update_profile(request: HttpRequest) -> HttpResponse:
    """Update the current user's profile fields.

    Any field omitted from the request body is left unchanged.

    Args:
        request: POST request with a JSON body containing any combination of:
            first_name, last_name, email, major, skills, interests,
            availability, preferred_contact_method, and notification flags.

    Returns:
        JsonResponse with success status and the user's id.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": "Failed to authenticate user"})

    user_id = request.user.id

    try:
        user = CollaboUser.objects.get(id=user_id)

        user.first_name = json_body.get("first_name", user.first_name)
        user.last_name = json_body.get("last_name", user.last_name)
        user.username = json_body.get("email", user.email)
        user.email = json_body.get("email", user.email)
        user.major = json_body.get("major", user.major)
        user.skills = json_body.get("skills", user.skills)
        user.interests = json_body.get("interests", user.interests)
        user.availability = json_body.get("availability", user.availability)
        user.preferred_contact_method = json_body.get("preferred_contact_method", user.preferred_contact_method)
        user.active_project_notifications = json_body.get("active_project_notifications", user.active_project_notifications)
        user.project_expiration_notifications = json_body.get("project_expiration_notifications", user.project_expiration_notifications)
        user.weekly_update_notifications = json_body.get("weekly_update_notifications", user.weekly_update_notifications)

        user.save()

    except Exception:
        return JsonResponse({"success": False, "error": "Failed to update user profile"})
    return JsonResponse({"success": True, "id": user.id})


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def get_self_profile(request: HttpRequest) -> HttpResponse:
    """Return the full profile of the currently authenticated user.

    Args:
        request: GET request. No body required.

    Returns:
        JsonResponse containing all profile fields for the logged-in user.
    """
    if request.method != "GET":
        return HttpResponseBadRequest(b"HTTP method must be GET")

    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": "Failed to authenticate user"})

    res: dict[str, Any] = {"success": True}

    try:
        user_id = request.user.id
        user = CollaboUser.objects.get(id=user_id)

        res["id"] = user_id
        res["first_name"] = user.first_name
        res["last_name"] = user.last_name
        res["username"] = user.username
        res["email"] = user.email
        res["major"] = user.major
        res["skills"] = user.skills
        res["interests"] = user.interests
        res["availability"] = user.availability
        res["preferred_contact_method"] = user.preferred_contact_method
        res["active_project_notifications"] = user.active_project_notifications
        res["project_expiration_notifications"] = user.project_expiration_notifications
        res["weekly_update_notifications"] = user.weekly_update_notifications
        res["is_staff"] = user.is_staff

    except Exception:
        return JsonResponse({"success": False, "error": "Failed to get profile"})
    return JsonResponse(res)


@csrf_exempt
@login_required(login_url=LOGIN_PAGE_URL)
def get_profile(request: HttpRequest) -> HttpResponse:
    """Return the public profile of any user by their id.

    Args:
        request: POST request with JSON body containing id (int).

    Returns:
        JsonResponse with the target user's public profile fields.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": "Failed to authenticate user"})

    res: dict[str, Any] = {"success": True}

    try:
        user_id = json_body.get("id")

        if user_id is None:
            return JsonResponse({"success": False, "error": "No user id supplied"})

        user = CollaboUser.objects.get(id=user_id)

        res["first_name"] = user.first_name
        res["last_name"] = user.last_name
        res["username"] = user.username
        res["email"] = user.email
        res["major"] = user.major
        res["skills"] = user.skills
        res["interests"] = user.interests
        res["availability"] = user.availability
        res["preferred_contact_method"] = user.preferred_contact_method
        res["is_staff"] = user.is_staff

    except Exception:
        return JsonResponse({"success": False, "error": "Failed to update user profile"})
    return JsonResponse(res)
