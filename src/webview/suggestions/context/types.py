from dataclasses import dataclass
from enum import Enum

from shared.logs.batches import batch_events
from shared.logs.events import (
    Maintainer,  # FIXME(@florent): This is to import it from that module
    RawEventType,
    remove_canceling_events,
)
from shared.logs.fetchers import fetch_suggestion_events
from shared.models.linkage import CVEDerivationClusterProposal

# CVEs


@dataclass
class Reference:
    url: str
    name: str
    tags: list[str]


# Packages


@dataclass
class PackageListContext:
    active: dict
    ignored: dict
    frozen: bool
    user_can_edit: bool
    suggestion_id: int
    # FIXME(@florentc): Add a state for whether to pre-open the "ignored
    # packages" list, in case it was already opened before component update


@dataclass
class SuggestionStubContext:
    suggestion: CVEDerivationClusterProposal
    issue_link: str | None
    undo_status_target: str | None  # FIXME(@florentc): change to the real enum type
    undo_rejection_reason: CVEDerivationClusterProposal.RejectionReason | None
    show_affected_product: bool = False
    is_compact: bool = False


# Maintainers


class MaintainerStatus(Enum):
    NON_EDITABLE = "non-editable"
    IGNORABLE = "ignorable"
    RESTORABLE = "restorable"
    DELETABLE = "deletable"


@dataclass
class MaintainerContext:
    maintainer: Maintainer
    frozen: bool
    user_can_edit: bool
    status: MaintainerStatus
    suggestion_id: int


@dataclass
class MaintainerAddContext:
    suggestion_id: int
    error_message: str | None = None


@dataclass
class MaintainerListContext:
    active: list[MaintainerContext]
    ignored: list[MaintainerContext]
    additional: list[MaintainerContext]
    frozen: bool
    user_can_edit: bool
    suggestion_id: int
    maintainer_add_context: MaintainerAddContext


# Suggestions


class SuggestionContext:
    def __init__(
        self,
        suggestion: CVEDerivationClusterProposal,
        user_can_edit: bool,
        pre_fetched_events: list[RawEventType],
        is_compact: bool = False,
    ) -> None:
        self.show_status: bool = True
        self.user_can_edit: bool = user_can_edit
        self.is_compact: bool = is_compact
        self.suggestion: CVEDerivationClusterProposal = suggestion
        self.suggestion_stub_context: SuggestionStubContext | None = None
        self.update_package_list_context(user_can_edit=user_can_edit)
        self.update_maintainer_list_context(user_can_edit=user_can_edit)
        self.update_references()
        self.activity_log = batch_events(
            remove_canceling_events(pre_fetched_events, sort=True)
        )
        self.error_message: str | None = None

    def update_package_list_context(
        self,
        user_can_edit: bool,
    ) -> None:
        active_packages = self.suggestion.cached.payload["packages"]
        self.package_list_context = PackageListContext(
            active=active_packages,
            ignored={
                k: v
                for k, v in self.suggestion.cached.payload["original_packages"].items()
                if k not in active_packages
            },
            frozen = self.suggestion.is_frozen,
            user_can_edit=user_can_edit,
            suggestion_id=self.suggestion.pk,
        )

    def update_maintainer_list_context(
        self,
        user_can_edit: bool,
        maintainer_add_error_message: str | None = None,
    ) -> None:
        # FIXME(@florent): There is a pydantic model for cached suggestions and
        # categorized maintainers. I'd be nice to use it rather than browse untyped
        # dictionaries.

        categorized_maintainers = self.suggestion.cached.payload[
            "categorized_maintainers"
        ]
        frozen = self.suggestion.is_frozen

        active_contexts = [
            MaintainerContext(
                maintainer=maintainer,
                frozen=frozen,
                user_can_edit=user_can_edit,
                status=MaintainerStatus.IGNORABLE,
                suggestion_id=self.suggestion.pk,
            )
            for maintainer in categorized_maintainers["active"]
        ]

        ignored_contexts = [
            MaintainerContext(
                maintainer=maintainer,
                frozen=frozen,
                user_can_edit=user_can_edit,
                status=MaintainerStatus.RESTORABLE,
                suggestion_id=self.suggestion.pk,
            )
            for maintainer in categorized_maintainers["ignored"]
        ]

        additional_contexts = [
            MaintainerContext(
                maintainer=maintainer,
                frozen=frozen,
                user_can_edit=user_can_edit,
                status=MaintainerStatus.DELETABLE,
                suggestion_id=self.suggestion.pk,
            )
            for maintainer in categorized_maintainers["added"]
        ]

        self.maintainer_list_context = MaintainerListContext(
            active=active_contexts,
            ignored=ignored_contexts,
            additional=additional_contexts,
            frozen=frozen,
            user_can_edit=user_can_edit,
            suggestion_id=self.suggestion.pk,
            # FIXME(@fricklerhandwerk): It's really opaque what this is for.
            # NOTE(@florentc): This is simply the context, meaning the data
            # necessary to render the template, for the "add maintainer"
            # widget. This follows the xxxxxx_context naming convention. The
            # widget requires the suggestion id to point to the right action
            # endpoint, and the optional error message to render next to it for
            # feedback.
            maintainer_add_context=MaintainerAddContext(
                self.suggestion.pk, maintainer_add_error_message
            ),
        )

    def update_references(self) -> None:
        refs: list[Reference] = []
        for container in self.suggestion.cve.container.all():
            for ref in container.references.all():
                refs.append(
                    Reference(
                        url=ref.url,
                        name=ref.name,
                        tags=[tag for tag in ref.tags.all()],
                    )
                )
        self.references = refs

    def fetch_activity_log(self) -> None:
        events = fetch_suggestion_events([self.suggestion.pk])
        self.activity_log = batch_events(
            remove_canceling_events(events[self.suggestion.pk], sort=True)
        )
