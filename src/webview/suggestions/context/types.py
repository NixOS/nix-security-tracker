from dataclasses import dataclass
from enum import Enum

from shared.logs.batches import batch_events
from shared.logs.events import (
    Maintainer,  # FIXME(@florent): This is to import it from that module
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
    editable: bool
    # FIXME(@fricklerhandwerk): Arguably the same thing as `editable` if both views and template handle it right.
    can_edit: bool
    suggestion_id: int
    # FIXME(@florentc): Add a state for whether to pre-open the "ignored
    # packages" list, in case it was already opened before component update


@dataclass
class SuggestionStubContext:
    suggestion: CVEDerivationClusterProposal
    issue_link: str | None
    undo_status_target: str | None  # FIXME(@florentc): change to the real enum type
    show_affected_product: bool = False


# Maintainers


class MaintainerStatus(Enum):
    NON_EDITABLE = "non-editable"
    IGNORABLE = "ignorable"
    RESTORABLE = "restorable"
    DELETABLE = "deletable"


@dataclass
class MaintainerContext:
    maintainer: Maintainer
    editable: bool
    # FIXME(@fricklerhandwerk): Arguably the same thing as `editable` if both views and template handle it right.
    can_edit: bool
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
    editable: bool
    # FIXME(@fricklerhandwerk): Arguably the same thing as `editable` if both views and template handle it right.
    can_edit: bool
    suggestion_id: int
    maintainer_add_context: MaintainerAddContext


# Suggestions


class SuggestionContext:
    def __init__(
        self,
        suggestion: CVEDerivationClusterProposal,
        can_edit: bool,
    ) -> None:
        self.show_status: bool = True
        self.can_edit: bool = can_edit
        self.suggestion: CVEDerivationClusterProposal = suggestion
        self.suggestion_stub_context: SuggestionStubContext | None = None
        self.update_package_list_context(can_edit=can_edit)
        self.update_maintainer_list_context(can_edit=can_edit)
        self.update_references()
        # FIXME(@fricklerhandwerk): Constructor should take pre-fetched events in argument
        self.fetch_activity_log()
        self.error_message: str | None = None

    def update_package_list_context(
        self,
        can_edit: bool,
    ) -> None:
        active_packages = self.suggestion.cached.payload["packages"]
        self.package_list_context = PackageListContext(
            active=active_packages,
            ignored={
                k: v
                for k, v in self.suggestion.cached.payload["original_packages"].items()
                if k not in active_packages
            },
            editable=self.suggestion.is_editable,
            can_edit=can_edit,
            suggestion_id=self.suggestion.pk,
        )

    def update_maintainer_list_context(
        self,
        can_edit: bool,
        maintainer_add_error_message: str | None = None,
    ) -> None:
        # FIXME(@florent): There is a pydantic model for cached suggestions and
        # categorized maintainers. I'd be nice to use it rather than browse untyped
        # dictionaries.

        categorized_maintainers = self.suggestion.cached.payload[
            "categorized_maintainers"
        ]
        editable = self.suggestion.is_editable

        active_contexts = [
            MaintainerContext(
                maintainer=maintainer,
                editable=editable,
                can_edit=can_edit,
                status=MaintainerStatus.IGNORABLE,
                suggestion_id=self.suggestion.pk,
            )
            for maintainer in categorized_maintainers["active"]
        ]

        ignored_contexts = [
            MaintainerContext(
                maintainer=maintainer,
                editable=editable,
                can_edit=can_edit,
                status=MaintainerStatus.RESTORABLE,
                suggestion_id=self.suggestion.pk,
            )
            for maintainer in categorized_maintainers["ignored"]
        ]

        additional_contexts = [
            MaintainerContext(
                maintainer=maintainer,
                editable=editable,
                can_edit=can_edit,
                status=MaintainerStatus.DELETABLE,
                suggestion_id=self.suggestion.pk,
            )
            for maintainer in categorized_maintainers["added"]
        ]

        self.maintainer_list_context = MaintainerListContext(
            active=active_contexts,
            ignored=ignored_contexts,
            additional=additional_contexts,
            editable=editable,
            can_edit=can_edit,
            suggestion_id=self.suggestion.pk,
            # FIXME(@fricklerhandwerk): It's really opaque what this is for.
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
        raw_events = fetch_suggestion_events(self.suggestion.pk)
        self.activity_log = batch_events(remove_canceling_events(raw_events, sort=True))
