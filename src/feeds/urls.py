from django.urls import path

from .feeds import PackageFeed

app_name = "feeds"

urlpatterns = [
    path("package/<path:attribute>/", PackageFeed(), name="package_feed"),
]
