from django.urls import path
from . import views

urlpatterns = [
    path("prompt_llm", views.prompt_llm, name="prompt_llm"),
]
