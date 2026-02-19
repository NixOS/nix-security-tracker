from shared.models.linkage import CVEDerivationClusterProposal
from webview.suggestions.context.types import (
    MaintainerAddContext,
    MaintainerContext,
    MaintainerListContext,
    MaintainerStatus,
    PackageListContext,
)


def get_package_list_context(
    suggestion: CVEDerivationClusterProposal,
    can_edit: bool,
) -> PackageListContext:
    # Split packages into active and ignored
    all_packages = suggestion.cached.payload["original_packages"]
    active_packages = suggestion.cached.payload["packages"]
    ignored_packages = {
        k: v for k, v in all_packages.items() if k not in active_packages
    }

    return PackageListContext(
        active=active_packages,
        ignored=ignored_packages,
        editable=suggestion.is_editable,
        can_edit=can_edit,
        suggestion_id=suggestion.pk,
    )


def get_maintainer_list_context(
    suggestion: CVEDerivationClusterProposal,
    can_edit: bool,
    maintainer_add_error_message: str | None = None,
) -> MaintainerListContext:
    # FIXME(@florent): There is a pydantic model for cached suggestions and
    # categorized maintainers. I'd be nice to use it rather than browse untyped
    # dictionaries.

    # Access categorized maintainers from cached payload dictionary
    categorized_maintainers = suggestion.cached.payload["categorized_maintainers"]
    editable = suggestion.is_editable

    # Create MaintainerContext objects for each category
    active_contexts = [
        MaintainerContext(
            maintainer=maintainer,
            editable=editable,
            can_edit=can_edit,
            status=MaintainerStatus.IGNORABLE,
            suggestion_id=suggestion.pk,
        )
        for maintainer in categorized_maintainers["active"]
    ]

    ignored_contexts = [
        MaintainerContext(
            maintainer=maintainer,
            editable=editable,
            can_edit=can_edit,
            status=MaintainerStatus.RESTORABLE,
            suggestion_id=suggestion.pk,
        )
        for maintainer in categorized_maintainers["ignored"]
    ]

    additional_contexts = [
        MaintainerContext(
            maintainer=maintainer,
            editable=editable,
            can_edit=can_edit,
            status=MaintainerStatus.DELETABLE,
            suggestion_id=suggestion.pk,
        )
        for maintainer in categorized_maintainers["added"]
    ]

    return MaintainerListContext(
        active=active_contexts,
        ignored=ignored_contexts,
        additional=additional_contexts,
        editable=editable,
        can_edit=can_edit,
        suggestion_id=suggestion.pk,
        maintainer_add_context=MaintainerAddContext(
            suggestion.pk, maintainer_add_error_message
        ),
    )
