
from django.urls import path
from . import views

urlpatterns = [
  path("update_profile", views.update_profile, name="update_profile"),
  path("get_self_profile", views.get_self_profile, name="get_self_profile"),
  path("get_profile", views.get_profile, name="get_profile"),
]
