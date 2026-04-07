from django.urls import path
from . import views


urlpatterns = [
    path("register/", views.register_user, name="register_user"),
    path("login/", views.login_user, name="login_user"),
    path("verify-email/", views.verify_email, name="verify_email"),
    path("whoami/", views.whoami, name="whoami"),
    path("logout/", views.logout_user, name="logout_user"),
]
