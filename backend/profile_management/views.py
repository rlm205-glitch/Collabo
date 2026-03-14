import json
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
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": "Failed to update user profile"})

    user_id = request.user.id

    try:
        user = CollaboUser.objects.get(
            id=user_id
        )

        user.first_name = json_body.get("first_name", user.first_name)
        user.last_name = json_body.get("last_name", user.last_name)
        user.username = user.first_name + " " + user.last_name
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
