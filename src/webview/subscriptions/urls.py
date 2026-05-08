from django.urls import path

from .views import (
    AddSubscriptionView,
    PackageSubscriptionView,
    RemoveSubscriptionView,
    SetNotificationEmailView,
    SubscriptionCenterView,
    ToggleAutoSubscribeView,
    ToggleReceiveEmailNotificationsView,
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
        "toggle-receive-email-notifications/",
        ToggleReceiveEmailNotificationsView.as_view(),
        name="toggle_receive_email_notifications",
    ),
    path(
        "set-email/",
        SetNotificationEmailView.as_view(),
        name="set_email",
    ),
    path(
        "package/<str:package_name>/", PackageSubscriptionView.as_view(), name="package"
    ),
]
