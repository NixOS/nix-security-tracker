from django.urls import path

from shared.models.linkage import (
    CVEDerivationClusterProposal,
)
from webview.suggestions.views.references import (
    IgnoreReferenceView,
    RestoreReferenceView,
)

from .views.detail import SuggestionDetailByCveView, SuggestionDetailView
from .views.lists import (
    SuggestionListView,
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
        SuggestionListView.as_view(
            status_filter=CVEDerivationClusterProposal.Status.PENDING
        ),
        name="untriaged_suggestions",
    ),
    path(
        "accepted/",
        SuggestionListView.as_view(
            status_filter=CVEDerivationClusterProposal.Status.ACCEPTED
        ),
        name="accepted_suggestions",
    ),
    path(
        "dismissed/",
        SuggestionListView.as_view(
            status_filter=CVEDerivationClusterProposal.Status.REJECTED
        ),
        name="dismissed_suggestions",
    ),
    path(
        "by-package/<path:package_name>",
        SuggestionListView.as_view(),
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
    # Reference operations
    path(
        "by-id/<int:suggestion_id>/reference/ignore/",
        IgnoreReferenceView.as_view(),
        name="ignore_reference",
    ),
    path(
        "by-id/<int:suggestion_id>/reference/restore/",
        RestoreReferenceView.as_view(),
        name="restore_reference",
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
