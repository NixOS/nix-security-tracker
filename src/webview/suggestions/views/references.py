from abc import ABC, abstractmethod

from django.db import transaction
from django.http import HttpRequest, HttpResponse

from shared.models.cve import Reference
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    ReferenceOverlay,
)

from .base import SuggestionContentEditBaseView


class ReferenceOperationBaseView(SuggestionContentEditBaseView, ABC):
    def post(
        self, request: HttpRequest, suggestion_id: int, reference_id: int
    ) -> HttpResponse:
        """Handle reference operation requests."""
        # Check edition is allowed and get suggestion
        try:
            is_compact = request.POST.get("is_compact") == "true"
            suggestion, suggestion_context = (
                self._check_access_rights_and_get_suggestion(
                    request, suggestion_id, is_compact=is_compact
                )
            )
        except self.ForbiddenOperationError as e:
            return e.response

        # Validate the requested operation
        validation_error = self._validate_operation(suggestion, reference_id)
        if validation_error:
            return self._handle_error(request, suggestion_context, validation_error)

        # Perform the specific operation
        try:
            self._perform_operation(suggestion, reference_id)
        except Exception:
            return self._handle_error(
                request,
                suggestion_context,
                f"Unable to {self._get_operation_name()} reference",
            )

        # Refresh the reference list context and activity_log
        suggestion_context.update_reference_list_context(
            user_can_edit=True,  # Prior permission checks enforce this.
            is_compact=is_compact,
        )
        suggestion_context.fetch_activity_log()

        # Maintain compact view if needed

        # Return response
        if request.headers.get("HX-Request"):
            return self.render_to_response({"data": suggestion_context})
        else:
            return self._redirect_to_origin(request)

    @abstractmethod
    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, reference_id: int
    ) -> None:
        """Perform the specific reference operation. To be implemented by subclasses."""
        pass

    @abstractmethod
    def _validate_operation(
        self, suggestion: CVEDerivationClusterProposal, reference_id: int
    ) -> str | None:
        """Validate if the operation can be performed. Return error message or None."""
        pass

    @abstractmethod
    def _get_operation_name(self) -> str:
        """Get the operation name for error messages. To be implemented by subclasses."""
        pass


class IgnoreReferenceView(ReferenceOperationBaseView):
    """Ignore a reference that was automatically assigned to the suggestion."""

    def _validate_operation(
        self, suggestion: CVEDerivationClusterProposal, reference_id: int
    ) -> str | None:
        """Validate that the reference can be ignored."""
        # Check if the reference exists in the original references
        categorized_references = suggestion.cached.payload["categorized_references"]
        original_references = categorized_references["original"]

        # Find if this reference_id exists in original references
        reference_exists = any(
            reference.get("id") == reference_id for reference in original_references
        )

        if not reference_exists:
            return "Reference not found in the suggestion"

        # Check if already ignored (has a IGNORED edit)
        existing_edit = suggestion.reference_overlays.filter(
            reference__id=reference_id, type=ReferenceOverlay.Type.IGNORED
        ).first()

        if existing_edit:
            return "Reference is already ignored"

        return None

    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, reference_id: int
    ) -> None:
        with transaction.atomic():
            # Get the reference object
            reference = Reference.objects.get(id=reference_id)

            # Create the reference edit
            edit, created = suggestion.reference_overlays.get_or_create(
                reference=reference,
                defaults={"type": ReferenceOverlay.Type.IGNORED},
            )
            if not created and edit.type != ReferenceOverlay.Type.IGNORED:
                edit.type = ReferenceOverlay.Type.IGNORED
                edit.save()

            # Update the cached categorized references
            cat_refs = suggestion.cached.payload["categorized_references"]
            cat_refs["active"] = [
                r for r in cat_refs["active"] if r["id"] != reference_id
            ]
            if ref := next(
                (r for r in cat_refs["original"] if r["id"] == reference_id), None
            ):
                cat_refs["ignored"].append(ref)

            # Save the suggestion
            suggestion.cached.save()

    def _get_operation_name(self) -> str:
        return "ignore"


class RestoreReferenceView(ReferenceOperationBaseView):
    """Restore a reference that was previously ignored."""

    def _validate_operation(
        self, suggestion: CVEDerivationClusterProposal, reference_id: int
    ) -> str | None:
        """Validate that the reference can be restored."""
        # Check if the reference exists in the ignored references
        categorized_references = suggestion.cached.payload["categorized_references"]
        ignored_references = categorized_references["ignored"]

        # Find if this reference_id exists in ignored references
        reference_exists = any(
            reference.get("id") == reference_id for reference in ignored_references
        )

        if not reference_exists:
            return "Reference not found in ignored references"

        # Check if there's a IGNORED edit to restore (there should be one)
        existing_edit = suggestion.reference_overlays.filter(
            reference__id=reference_id, type=ReferenceOverlay.Type.IGNORED
        ).first()

        if not existing_edit:
            return "No ignore overlay found for this reference"

        return None

    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, reference_id: int
    ) -> None:
        with transaction.atomic():
            # Remove the IGNORED edit to restore the reference
            suggestion.reference_overlays.get(
                reference__id=reference_id,
                type=ReferenceOverlay.Type.IGNORED,
            ).delete()

            # Update the cached categorized references
            cat_refs = suggestion.cached.payload["categorized_references"]
            cat_refs["ignored"] = [
                r for r in cat_refs["ignored"] if r["id"] != reference_id
            ]
            if ref := next(
                (r for r in cat_refs["original"] if r["id"] == reference_id), None
            ):
                cat_refs["active"].append(ref)

            # Save the suggestion
            suggestion.cached.save()

    def _get_operation_name(self) -> str:
        return "restore"
