from abc import ABC, abstractmethod

from django.contrib import messages
from django.db import transaction
from django.http import HttpRequest, HttpResponse

from shared.github import fetch_user_info
from shared.listeners.cache_suggestions import to_dict
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    MaintainersEdit,
)
from shared.models.nix_evaluation import NixMaintainer
from webview.suggestions.context.builders import (
    get_maintainer_list_context,
)
from webview.suggestions.context.types import SuggestionContext

from .base import SuggestionContentEditBaseView, fetch_activity_log


class MaintainerOperationBaseView(SuggestionContentEditBaseView, ABC):
    def post(
        self, request: HttpRequest, suggestion_id: int, github_id: int
    ) -> HttpResponse:
        """Handle maintainer operation requests."""
        # Check edition is allowed and get suggestion
        try:
            suggestion, suggestion_context = (
                self._check_access_rights_and_get_suggestion(request, suggestion_id)
            )
        except self.ForbiddenOperationError as e:
            return e.response

        # Validate the requested operation
        validation_error = self._validate_operation(suggestion, github_id)
        if validation_error:
            return self._handle_error(request, suggestion_context, validation_error)

        # Perform the specific operation
        try:
            self._perform_operation(suggestion, github_id)
        except Exception:
            return self._handle_error(
                request,
                suggestion_context,
                f"Unable to {self._get_operation_name()} maintainer",
            )

        # Refresh the maintainer list context and activity_log
        suggestion_context.maintainer_list_context = get_maintainer_list_context(
            suggestion,
            can_edit=True,  # Prior permission checks enforce this.
        )
        suggestion_context.activity_log = fetch_activity_log(suggestion.pk)

        # Return response
        if request.headers.get("HX-Request"):
            return self.render_to_response({"data": suggestion_context})
        else:
            return self._redirect_to_origin(request)

    @abstractmethod
    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> None:
        """Perform the specific maintainer operation. To be implemented by subclasses."""
        pass

    @abstractmethod
    def _validate_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> str | None:
        """Validate if the operation can be performed. Return error message or None."""
        pass

    @abstractmethod
    def _get_operation_name(self) -> str:
        """Get the operation name for error messages. To be implemented by subclasses."""
        pass


class IgnoreMaintainerView(MaintainerOperationBaseView):
    """Ignore a maintainer that was automatically assigned to the suggestion."""

    def _validate_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> str | None:
        """Validate that the maintainer can be ignored."""
        # Check if the maintainer exists in the original maintainers
        categorized_maintainers = suggestion.cached.payload["categorized_maintainers"]
        original_maintainers = categorized_maintainers["original"]

        # Find if this github_id exists in original maintainers
        maintainer_exists = any(
            maintainer.get("github_id") == github_id
            for maintainer in original_maintainers
        )

        if not maintainer_exists:
            return "Maintainer not found in original maintainers"

        # Check if already ignored (has a REMOVE edit)
        existing_edit = suggestion.maintainers_edits.filter(
            maintainer__github_id=github_id, edit_type=MaintainersEdit.EditType.REMOVE
        ).first()

        if existing_edit:
            return "Maintainer is already ignored"

        return None

    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> None:
        with transaction.atomic():
            # Get the maintainer object
            maintainer = NixMaintainer.objects.get(github_id=github_id)

            # Create the maintainer edit
            edit, created = suggestion.maintainers_edits.get_or_create(
                maintainer=maintainer,
                defaults={"edit_type": MaintainersEdit.EditType.REMOVE},
            )
            if not created and edit.edit_type != MaintainersEdit.EditType.REMOVE:
                edit.edit_type = MaintainersEdit.EditType.REMOVE
                edit.save()

            # Update the cached categorized maintainers
            categorized_maintainers = suggestion.cached.payload[
                "categorized_maintainers"
            ]
            categorized_maintainers["active"] = [
                m
                for m in categorized_maintainers["active"]
                if m["github_id"] != github_id
            ]
            categorized_maintainers["ignored"].append(to_dict(maintainer))

            # Save the suggestion
            suggestion.cached.save()

    def _get_operation_name(self) -> str:
        return "ignore"


class RestoreMaintainerView(MaintainerOperationBaseView):
    """Restore a maintainer that was previously ignored."""

    def _validate_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> str | None:
        """Validate that the maintainer can be restored."""
        # Check if the maintainer exists in the ignored maintainers
        categorized_maintainers = suggestion.cached.payload["categorized_maintainers"]
        ignored_maintainers = categorized_maintainers["ignored"]

        # Find if this github_id exists in ignored maintainers
        maintainer_exists = any(
            maintainer.get("github_id") == github_id
            for maintainer in ignored_maintainers
        )

        if not maintainer_exists:
            return "Maintainer not found in ignored maintainers"

        # Check if there's a REMOVE edit to restore (there should be one)
        existing_edit = suggestion.maintainers_edits.filter(
            maintainer__github_id=github_id, edit_type=MaintainersEdit.EditType.REMOVE
        ).first()

        if not existing_edit:
            return "No ignore edit found for this maintainer"

        return None

    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> None:
        with transaction.atomic():
            # Remove the REMOVE edit to restore the maintainer
            edit_to_remove = suggestion.maintainers_edits.get(
                maintainer__github_id=github_id,
                edit_type=MaintainersEdit.EditType.REMOVE,
            )
            edit_to_remove.delete()
            maintainer = edit_to_remove.maintainer

            # Update the cached categorized maintainers
            categorized_maintainers = suggestion.cached.payload[
                "categorized_maintainers"
            ]
            categorized_maintainers["ignored"] = [
                m
                for m in categorized_maintainers["ignored"]
                if m["github_id"] != github_id
            ]
            categorized_maintainers["active"].append(to_dict(maintainer))

            # Save the suggestion
            suggestion.cached.save()

    def _get_operation_name(self) -> str:
        return "restore"


class DeleteMaintainerView(MaintainerOperationBaseView):
    """Delete a maintainer that was manually added."""

    def _validate_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> str | None:
        """Validate that the maintainer can be deleted (only manually added maintainers)."""
        # Check if the maintainer exists in the added maintainers
        categorized_maintainers = suggestion.cached.payload["categorized_maintainers"]
        added_maintainers = categorized_maintainers["added"]

        # Find if this github_id exists in added maintainers
        maintainer_exists = any(
            maintainer.get("github_id") == github_id for maintainer in added_maintainers
        )

        if not maintainer_exists:
            return "Only manually added maintainers can be deleted"

        # Check if there's an ADD edit to remove (there should be one)
        existing_edit = suggestion.maintainers_edits.filter(
            maintainer__github_id=github_id, edit_type=MaintainersEdit.EditType.ADD
        ).first()

        if not existing_edit:
            return "No add edit found for this maintainer"

        return None

    def _perform_operation(
        self, suggestion: CVEDerivationClusterProposal, github_id: int
    ) -> None:
        with transaction.atomic():
            # Remove the ADD edit to delete the maintainer
            edit_to_remove = suggestion.maintainers_edits.get(
                maintainer__github_id=github_id,
                edit_type=MaintainersEdit.EditType.ADD,
            )
            edit_to_remove.delete()

            # Update the cached categorized maintainers
            categorized_maintainers = suggestion.cached.payload[
                "categorized_maintainers"
            ]
            categorized_maintainers["added"] = [
                m
                for m in categorized_maintainers["added"]
                if m["github_id"] != github_id
            ]

            # Save the suggestion
            suggestion.cached.save()

    def _get_operation_name(self) -> str:
        return "delete"


class AddMaintainerView(SuggestionContentEditBaseView):
    """Manually add a maintainer that was not originally assigned to the suggestion."""

    # NOTE(@florentc): We override the regular handle error here so that we
    # display error messages related to adding new maintainers next to the text
    # field instead of the suggestion itself.
    def _handle_error(
        self,
        request: HttpRequest,
        suggestion_context: SuggestionContext,
        error_message: str,
    ) -> HttpResponse:
        """Handle error responses for both HTMX and standard requests."""
        suggestion_context.maintainer_list_context.maintainer_add_context.error_message = error_message
        if request.headers.get("HX-Request"):
            return self.render_to_response({"data": suggestion_context})
        else:
            # Without javascript, we use Django messages for the errors
            messages.error(request, error_message)
            return self._redirect_to_origin(request)

    def post(self, request: HttpRequest, suggestion_id: int) -> HttpResponse:
        # Check edition is allowed and get suggestion
        try:
            suggestion, suggestion_context = (
                self._check_access_rights_and_get_suggestion(request, suggestion_id)
            )
        except self.ForbiddenOperationError as e:
            return e.response

        # Validate the provided handle
        new_maintainer_github_handle = request.POST.get("new_maintainer_github_handle")
        if not new_maintainer_github_handle:
            return self._handle_error(
                request, suggestion_context, "No GitHub handle was provided"
            )
        if any(
            str(m["github"]) == new_maintainer_github_handle
            for m in suggestion.cached.payload["categorized_maintainers"]["original"]
        ):
            return self._handle_error(
                request, suggestion_context, "Already a maintainer"
            )

        # Try to fetch the maintainer from our db
        maintainer = NixMaintainer.objects.filter(
            github=new_maintainer_github_handle
        ).first()

        # Try to fetch maintainer info from GitHub API and create if found
        if not maintainer:
            gh_user = fetch_user_info(new_maintainer_github_handle)
            if gh_user:
                maintainer, created = NixMaintainer.objects.update_or_create(
                    github_id=gh_user["id"],
                    defaults={
                        "github": gh_user["login"],
                        "name": gh_user.get("name"),
                        "email": gh_user.get("email"),
                    },
                )
            else:
                return self._handle_error(
                    request,
                    suggestion_context,
                    "Could not fetch maintainer from GitHub",
                )

        # Perform the operation
        with transaction.atomic():
            # Add the maintainer edit
            edit, created = suggestion.maintainers_edits.get_or_create(
                maintainer=maintainer,
                defaults={"edit_type": MaintainersEdit.EditType.ADD},
            )
            if not created and edit.edit_type != MaintainersEdit.EditType.ADD:
                edit.edit_type = MaintainersEdit.EditType.ADD
                edit.save()

            # Update the cached categorized maintainers
            categorized_maintainers = suggestion.cached.payload[
                "categorized_maintainers"
            ]
            # Add to active maintainers if not already there
            if not any(
                m["github_id"] == maintainer.github_id
                for m in categorized_maintainers["added"]
            ):
                categorized_maintainers["added"].append(to_dict(maintainer))

            # Save the suggestion
            suggestion.cached.save()

        # Refresh the maintainer list context and activity_log

        suggestion_context.maintainer_list_context = get_maintainer_list_context(
            suggestion,
            can_edit=True,  # Prior permission checks enforce this.
        )
        suggestion_context.activity_log = fetch_activity_log(suggestion.pk)

        # Return response
        if request.headers.get("HX-Request"):
            return self.render_to_response({"data": suggestion_context})
        else:
            return self._redirect_to_origin(request)
