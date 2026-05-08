from collections.abc import Callable

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal

_OUTDATED_VERSION: int = (
    CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION - 1  # type: ignore[operator]
)


def test_is_active_algorithm_match(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A proposal created by the current algorithm reports is_active_algorithm_match=True."""
    proposal = make_suggestion()

    assert proposal.is_active_algorithm_match is True

    proposal = make_suggestion(
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION - 1  # type: ignore
    )

    assert proposal.is_active_algorithm_match is False


def test_target_proposals_set(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    current_pending = make_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
    )
    outdated_pending = make_suggestion(
        container=make_container(cve_id="CVE-2025-1001"),
        status=CVEDerivationClusterProposal.Status.PENDING,
        algorithm_version=_OUTDATED_VERSION,
    )
    outdated_accepted = make_suggestion(
        container=make_container(cve_id="CVE-2025-1002"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=_OUTDATED_VERSION,
    )
    outdated_rejected = make_suggestion(
        container=make_container(cve_id="CVE-2025-1003"),
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
        algorithm_version=_OUTDATED_VERSION,
    )

    qs = CVEDerivationClusterProposal.objects.target_proposals()
    assert current_pending in qs
    assert outdated_accepted in qs
    assert outdated_rejected in qs
    assert outdated_pending not in qs
    assert qs.count() == 3
