from sqlite3 import IntegrityError
from django.shortcuts import render
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import ollama

@csrf_exempt
def prompt_llm(request: HttpRequest) -> HttpResponse:
    if request.method != "POST":
        return HttpResponseBadRequest(b"HTTP method must be POST")

    json_body: dict[str, str] = dict(json.loads(request.body))

    try:
        messages = [
            {"role": "user", "content": json_body.get("prompt")},
        ]
        response = ollama.chat(model="nemotron-3-nano:4b", messages=messages)

        return JsonResponse(
            {"success": True, "response": response["message"]["content"]}
        )
    except IntegrityError:
        return HttpResponseBadRequest(b"This project has been created already")
    except Exception:
        return HttpResponseBadRequest(b"Failed to create project")
