from dataclasses import dataclass

from pgpubsub.channel import Channel, TriggerChannel

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixEvaluation


@dataclass
class NewEvaluation(TriggerChannel):
    model = NixEvaluation
    # To avoid having a process blocked on the same evaluation multiple times.
    # We want to ensure that notifications are processed exactly once.
    # For this, we need to take a lock in the PostgreSQL database via `SELECT FOR UPDATE`
    # and let the pub-sub algorithm loop over available notifications with skip_locked.
    lock_notifications = True


@dataclass
class UpdatedEvaluation(TriggerChannel):
    model = NixEvaluation
    lock_notifications = True


@dataclass
class NewContainer(TriggerChannel):
    model = Container
    # Process new structured data for a CVE only once.
    lock_notifications = True


@dataclass
class NewSuggestion(TriggerChannel):
    model = CVEDerivationClusterProposal
    lock_notifications = True


@dataclass
class RefreshSuggestion(Channel):
    pk: int
    lock_notifications = True
