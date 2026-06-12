from django.urls import path

from .views import TokenManagementView

app_name = "tokens"

urlpatterns = [
    path("", TokenManagementView.as_view(), name="manage"),
]
