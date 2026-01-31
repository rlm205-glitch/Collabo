from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def register_user(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))
    email = json_body.get("email")
    password: str =  json_body.get("password") or ""

    if not email:
        return HttpResponseBadRequest(b"Invalid email")

    try:
        validate_password(password)
        _ = User.objects.create_user(email, email=email, password=password)
    except ValidationError:
        return HttpResponseBadRequest(b"Invalid password")
    except IntegrityError:
        return HttpResponseBadRequest(b"This email already has an account")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create user")

    return redirect("/")

