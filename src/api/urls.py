from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView
from rest_framework import routers

from api.issues.views import NixpkgsIssueViewSet
from api.subscriptions.views import SubscriptionsViewSet
from api.suggestions.views import SuggestionViewSet

v1_router = routers.DefaultRouter(trailing_slash=False)
v1_router.register(r"issues", NixpkgsIssueViewSet)
v1_router.register("suggestions", SuggestionViewSet)
v1_router.register("subscriptions", SubscriptionsViewSet)

urlpatterns = [
    path("v1/", include(v1_router.urls)),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
]
