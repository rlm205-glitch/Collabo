"""Placeholder API views used for basic connectivity testing."""

from django.http import HttpRequest, JsonResponse
from django.shortcuts import render

def blank_call(request: HttpRequest) -> JsonResponse:
    """Handle a no-op API call for testing endpoint connectivity.

    Args:
        request: The incoming HTTP request.

    Returns:
        A JsonResponse confirming the call was received.
    """
    print(f"Somebody just sent an HTTP Request ({request.method}) to [domain]/apicall/")

    return JsonResponse({ "message": "You called a function that does nothing and it worked!" })

def print_hello_world(request: HttpRequest) -> JsonResponse:
    """Return a simple Hello World response for smoke-testing.

    Args:
        request: The incoming HTTP request.

    Returns:
        A JsonResponse containing a Hello World message.
    """
    print(f"Hello World")

    return JsonResponse({ "message": "Hello World, but I added sometihng" })
