from dataclasses import dataclass
from enum import Enum

from shared.logs.batches import FoldedEventType
from shared.logs.events import (
    Maintainer,  # FIXME(@florent): This is to import it from that module
)
from shared.models.linkage import CVEDerivationClusterProposal

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


@dataclass
class SuggestionContext:
    suggestion: CVEDerivationClusterProposal
    package_list_context: PackageListContext
    maintainer_list_context: MaintainerListContext
    can_edit: bool
    activity_log: list[FoldedEventType]
    show_status: bool = True
    suggestion_stub_context: SuggestionStubContext | None = None
    error_message: str | None = None
