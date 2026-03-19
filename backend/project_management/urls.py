from django.urls import path
from . import views

urlpatterns = [
    path("create_project/", views.create_project, name="create_project"),
    path("join_project/", views.join_project, name="join_project"),
    path("list_projects/", views.list_projects, name="list_projects"),
    path("get_project/", views.get_project, name="get_project"),
    path("delete_project/", views.delete_project, name="delete_project"),
    path("list_join_requests/", views.list_join_requests, name="list_join_requests"),
    path("decide_join_request/", views.decide_join_request, name="decide_join_request"),
]
