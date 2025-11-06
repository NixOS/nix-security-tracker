from django.urls import path

from .views import (
    AddSubscriptionView,
    PackageSubscriptionView,
    RemoveSubscriptionView,
    SubscriptionCenterView,
    ToggleAutoSubscribeView,
)

app_name = "subscriptions"

urlpatterns = [
    path("", SubscriptionCenterView.as_view(), name="center"),
    path("add/", AddSubscriptionView.as_view(), name="add"),
    path("remove/", RemoveSubscriptionView.as_view(), name="remove"),
    path(
        "toggle-auto-subscribe/",
        ToggleAutoSubscribeView.as_view(),
        name="toggle_auto_subscribe",
    ),
    path(
        "package/<str:package_name>/", PackageSubscriptionView.as_view(), name="package"
    ),
]
