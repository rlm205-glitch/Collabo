from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

def index(request: HttpRequest):
    return HttpResponse(b"Hello, Welcome to the posts page")

