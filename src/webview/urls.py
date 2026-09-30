from django.urls import path

from shared.auth.github_webhook import handle_github_hook

app_name = "webview"


urlpatterns = [
    path("github-webhook/", handle_github_hook, name="github_webhook"),
]
