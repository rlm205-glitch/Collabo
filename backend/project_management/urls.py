from django.urls import path
from . import views

urlpatterns = [
    path("create_project/", views.create_project, name="create_project"),
    path("join_project/", views.join_project, name="join_project"),
    path("list_projects/", views.list_projects, name="list_projects"),
    path("get_project/", views.get_project, name="get_project"),
]
