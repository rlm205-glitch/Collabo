from django.urls import path
from . import views

urlpatterns = [
    path("", views.blank_call, name="blank_call"),
    path("print_hello_world", views.print_hello_world, name="print_hello_world")
]
