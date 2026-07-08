from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView
from rest_framework import routers

from api.issues.views import NixpkgsIssueViewSet
from api.me import CurrentUserView
from api.server_info import ServerInfoView
from api.subscriptions.views import SubscriptionsViewSet
from api.suggestions.views import SuggestionViewSet
from api.tokens.views import TokenManagementView

v1_router = routers.DefaultRouter(trailing_slash=False)
v1_router.register(r"issues", NixpkgsIssueViewSet)
v1_router.register("suggestions", SuggestionViewSet)
v1_router.register("subscriptions", SubscriptionsViewSet)

urlpatterns = [
    path("v1/", include(v1_router.urls)),
    path("v1/me", CurrentUserView.as_view(), name="current-user"),
    path("v1/server-info", ServerInfoView.as_view(), name="server-info"),
    path("v1/tokens/me", TokenManagementView.as_view(), name="token-management"),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
]
