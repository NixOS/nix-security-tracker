from abc import ABC, abstractmethod

from django.db import transaction
from django.http import HttpRequest, HttpResponse

from shared.listeners.cache_suggestions import apply_package_edits
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    PackageEdit,
)
from webview.suggestions.context.builders import (
    get_package_list_context,
)

from .base import SuggestionContentEditBaseView, fetch_activity_log


class PackageOperationBaseView(SuggestionContentEditBaseView, ABC):
    """Base view for package operations (ignore/restore) with common functionality."""

    def post(
        self, request: HttpRequest, suggestion_id: int, package_attr: str
    ) -> HttpResponse:
        """Handle package operation requests."""
        # Check edition is allowed and get suggestion
        try:
            suggestion, suggestion_context = (
                self._check_access_rights_and_get_suggestion(request, suggestion_id)
            )
        except self.AccessDeniedError as e:
            return e.response

        # Validate that the package exists in the suggestion
        if package_attr not in suggestion.cached.payload.get("original_packages", {}):
            return self._handle_error(
                request, suggestion_context, "Package not found in this suggestion"
            )

        # Perform the specific operation (to be implemented by subclasses)
        try:
            with transaction.atomic():
                self._perform_operation(suggestion, package_attr)
                new_active_packages = apply_package_edits(
                    suggestion.cached.payload["original_packages"],
                    suggestion.package_edits.all(),
                )
                suggestion.cached.payload["packages"] = new_active_packages
                suggestion.cached.save()
        except Exception:
            return self._handle_error(
                request,
                suggestion_context,
                f"Unable to {self._get_operation_name()} package",
            )

        # Refresh the package list context and activity log
        suggestion_context.package_list_context = get_package_list_context(suggestion)
        suggestion_context.activity_log = fetch_activity_log(suggestion.pk)

        # Handle response based on request type
        if request.headers.get("HX-Request"):
            # For HTMX requests, return the updated component
            return self.render_to_response({"data": suggestion_context})
        else:
            # For non-HTMX requests, redirect to origin
            return self._redirect_to_origin(request)

    @abstractmethod
    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, package_attr: str
    ) -> None:
        """Perform the specific package operation. To be implemented by subclasses."""
        pass

    @abstractmethod
    def _get_operation_name(self) -> str:
        """Get the operation name for error messages. To be implemented by subclasses."""
        pass


class IgnorePackageView(PackageOperationBaseView):
    """Handle package ignore operations."""

    # TODO(@florentc): When we ignore a package, we'd like to automatically ignore its
    # maintainers

    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, package_attr: str
    ) -> None:
        """Create or update PackageEdit to ignore the package."""
        edit, created = suggestion.package_edits.get_or_create(
            package_attribute=package_attr,
            defaults={"edit_type": PackageEdit.EditType.REMOVE},
        )
        if not created and edit.edit_type != PackageEdit.EditType.REMOVE:
            edit.edit_type = PackageEdit.EditType.REMOVE
            edit.save()

    def _get_operation_name(self) -> str:
        return "ignore"


class RestorePackageView(PackageOperationBaseView):
    """Handle package restore operations."""

    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, package_attr: str
    ) -> None:
        """Remove PackageEdit entries to restore the package."""
        suggestion.package_edits.filter(
            package_attribute=package_attr,
            edit_type=PackageEdit.EditType.REMOVE,
        ).delete()

    def _get_operation_name(self) -> str:
        return "restore"
