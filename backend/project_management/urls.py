from django.urls import path
from . import views

urlpatterns = [
    path("create_project/", views.create_project, name="create_project"),
    path("join_project/", views.join_project, name="join_project"),
    path("list_projects/", views.list_projects, name="list_projects"),
    path("get_project/", views.get_project, name="get_project"),
    path("list_join_requests/", views.list_join_requests, name="list_join_requests"),
    path("decide_join_request/", views.decide_join_request, name="decide_join_request"),
    path("delete_project/", views.delete_project, name="delete_project"),
    path("report_project/", views.report_project, name="report_project"),
    path("list_reports/", views.list_reports, name="list_reports"),
    path("admin_delete_project/", views.admin_delete_project, name="admin_delete_project"),
]
