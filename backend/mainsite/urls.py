"""
URL configuration for mainsite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from django.http import FileResponse
from pathlib import Path
from django.conf import settings


def serve_frontend(request, *args, **kwargs):
    index = Path(settings.WHITENOISE_ROOT) / "index.html"
    return FileResponse(open(index, "rb"), content_type="text/html")


urlpatterns = [
    path("apicall/", include("api.urls")),
    path("authentication/", include("user_authentication.urls")),
    path("project_management/", include("project_management.urls")),
    path("profile_management/", include("profile_management.urls")),
    path("llm_api/", include("llm_integration.urls")),
    path("admin/", admin.site.urls),
    path("", serve_frontend),
    path("<path:path>", serve_frontend),
]
