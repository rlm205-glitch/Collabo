from django.urls import path
from . import views


urlpatterns = [
    path("register/", views.register_user, name="register_user"),
    path("login/", views.login_user, name="login_user"),
<<<<<<< HEAD
    path("verify-email/", views.verify_email, name="verify_email"),
=======
    path("verify-email/", views.verify_email),
>>>>>>> 352e71e (Add backend email verification)
]
