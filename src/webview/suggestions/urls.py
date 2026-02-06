from django.urls import path

from .views.detail import SuggestionDetailByCveView, SuggestionDetailView
from .views.lists import (
    AcceptedSuggestionsByPackageView,
    AcceptedSuggestionsView,
    PublishedSuggestionsByPackageView,
    PublishedSuggestionsView,
    RejectedSuggestionsByPackageView,
    RejectedSuggestionsView,
    SuggestionsByPackageView,
    UntriagedSuggestionsByPackageView,
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
    # Lists by package
    path(
        "by-package/<str:package_name>",
        SuggestionsByPackageView.as_view(),
        name="suggestions_by_package",
    ),
    path(
        "by-package/<str:package_name>/untriaged",
        UntriagedSuggestionsByPackageView.as_view(),
        name="untriaged_suggestions_by_package",
    ),
    path(
        "by-package/<str:package_name>/accepted",
        AcceptedSuggestionsByPackageView.as_view(),
        name="accepted_suggestions_by_package",
    ),
    path(
        "by-package/<str:package_name>/dismissed",
        RejectedSuggestionsByPackageView.as_view(),
        name="dismissed_suggestions_by_package",
    ),
    path(
        "by-package/<str:package_name>/published",
        PublishedSuggestionsByPackageView.as_view(),
        name="published_suggestions_by_package",
    ),
    # Status change operation
    path(
        "by-id/<int:suggestion_id>/status",
        UpdateSuggestionStatusView.as_view(),
        name="update_status",
    ),
    # Package operations
    path(
        "by-id/<int:suggestion_id>/packages/<str:package_attr>/ignore/",
        IgnorePackageView.as_view(),
        name="ignore_package",
    ),
    path(
        "by-id/<int:suggestion_id>/packages/<str:package_attr>/restore/",
        RestorePackageView.as_view(),
        name="restore_package",
    ),
    # Maintainers operations
    path(
        "by-id/<int:suggestion_id>/maintainers/<int:github_id>/ignore/",
        IgnoreMaintainerView.as_view(),
        name="ignore_maintainer",
    ),
    path(
        "by-id/<int:suggestion_id>/maintainers/<int:github_id>/delete/",
        DeleteMaintainerView.as_view(),
        name="delete_maintainer",
    ),
    path(
        "by-id/<int:suggestion_id>/maintainers/<int:github_id>/restore/",
        RestoreMaintainerView.as_view(),
        name="restore_maintainer",
    ),
    path(
        "by-id/<int:suggestion_id>/maintainers/add/",
        AddMaintainerView.as_view(),
        name="add_maintainer",
    ),
]
