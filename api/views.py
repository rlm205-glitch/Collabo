from django.http import HttpRequest, JsonResponse
from django.shortcuts import render

def blank_call(request: HttpRequest) -> JsonResponse:
    print(f"Somebody just sent an HTTP Request ({request.method}) to [domain]/apicall/")

    return JsonResponse({ "message": "You called a function that does nothing and it worked!" })

def print_hello_world(request: HttpRequest) -> JsonResponse:
    print(f"Hello World")

    return JsonResponse({ "message": "Hello World" })
