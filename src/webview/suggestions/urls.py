from django.urls import path

from .views.detail import SuggestionDetailByCveView, SuggestionDetailView
from .views.lists import (
    AcceptedSuggestionsView,
    PublishedSuggestionsView,
    RejectedSuggestionsView,
    SuggestionsByPackageView,
    UntriagedSuggestionsView,
)
from .views.maintainers import (
    AddMaintainerView,
    DeleteMaintainerView,
    IgnoreMaintainerView,
    RestoreMaintainerView,
)
from .views.packages import IgnorePackageView, RestorePackageView
from .views.status import UpdateSuggestionStatusView

app_name = "suggestion"

urlpatterns = [
    # Individual suggestion detail page
    path("by-id/<int:suggestion_id>/", SuggestionDetailView.as_view(), name="detail"),
    path(
        "by-cve/<str:cve_id>/",
        SuggestionDetailByCveView.as_view(),
        name="detail_by_cve",
    ),
    # Lists
    path(
        "untriaged/",
        UntriagedSuggestionsView.as_view(),
        name="untriaged_suggestions",
    ),
    path("accepted/", AcceptedSuggestionsView.as_view(), name="accepted_suggestions"),
    path(
        "dismissed/",
        RejectedSuggestionsView.as_view(),
        name="dismissed_suggestions",
    ),
    path(
        "published/",
        PublishedSuggestionsView.as_view(),
        name="published_suggestions",
    ),
    path(
        "by-package/<path:package_name>",
        SuggestionsByPackageView.as_view(),
        name="suggestions_by_package",
    ),
    # Status change operation
    path(
        "by-id/<int:suggestion_id>/status",
        UpdateSuggestionStatusView.as_view(),
        name="update_status",
    ),
    # Package operations
    path(
        "by-id/<int:suggestion_id>/package/ignore/<path:package_attr>/",
        IgnorePackageView.as_view(),
        name="ignore_package",
    ),
    path(
        "by-id/<int:suggestion_id>/package/restore/<path:package_attr>/",
        RestorePackageView.as_view(),
        name="restore_package",
    ),
    # Maintainers operations
    path(
        "by-id/<int:suggestion_id>/maintainer/ignore/<int:github_id>/",
        IgnoreMaintainerView.as_view(),
        name="ignore_maintainer",
    ),
    path(
        "by-id/<int:suggestion_id>/maintainer/delete/<int:github_id>/",
        DeleteMaintainerView.as_view(),
        name="delete_maintainer",
    ),
    path(
        "by-id/<int:suggestion_id>/maintainer/restore/<int:github_id>/",
        RestoreMaintainerView.as_view(),
        name="restore_maintainer",
    ),
    path(
        "by-id/<int:suggestion_id>/maintainer/add/",
        AddMaintainerView.as_view(),
        name="add_maintainer",
    ),
]
