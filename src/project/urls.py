"""
URL configuration for tracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.urls import include, path, re_path
from django.views.generic import TemplateView

# SPA catch-all: serves the same template for all /ui-v2/ sub-paths (client-side routing)
ui_v2_view = TemplateView.as_view(template_name="ui_v2.html")

urlpatterns = [
    path("", include("webview.urls")),
    path("api/", include("api.urls")),
    path("feeds/", include("feeds.urls")),
    path("admin/", admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("debug/", include("debug_toolbar.urls")),
    re_path(r"^ui-v2/(?:.*)?$", ui_v2_view, name="ui_v2"),
]
