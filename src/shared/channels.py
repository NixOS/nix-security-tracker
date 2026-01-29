from dataclasses import dataclass

from pgpubsub.channel import TriggerChannel

from shared.models import NixDerivation
from shared.models.cve import Container
from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixChannel, NixEvaluation


@dataclass
class NixChannelUpdateChannel(TriggerChannel):
    model = NixChannel
    lock_notifications = True


@dataclass
class NixChannelInsertChannel(TriggerChannel):
    model = NixChannel
    lock_notifications = True


@dataclass
class NixEvaluationChannel(TriggerChannel):
    model = NixEvaluation
    # To avoid having a process blocked on the same evaluation multiple times.
    # We want to ensure that notifications are processed exactly once.
    # For this, we need to take a lock in the PostgreSQL database via `SELECT FOR UPDATE`
    # and let the pub-sub algorithm loop over available notifications with skip_locked.
    lock_notifications = True


@dataclass
class NixDerivationChannel(TriggerChannel):
    model = NixDerivation


@dataclass
class ContainerChannel(TriggerChannel):
    model = Container
    # Process new structured data for a CVE only once.
    lock_notifications = True


@dataclass
class CVEDerivationClusterProposalCacheChannel(TriggerChannel):
    model = CVEDerivationClusterProposal
    lock_notifications = True


@dataclass
class CVEDerivationClusterProposalNotificationChannel(TriggerChannel):
    model = CVEDerivationClusterProposal
    lock_notifications = True


@dataclass
class NixpkgsIssueChannel(TriggerChannel):
    model = NixpkgsIssue
    lock_notifications = False
