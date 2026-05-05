from collections.abc import Callable

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation


def test_is_active_algorithm_match_current_version(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A proposal created by the current algorithm reports is_active_algorithm_match=True."""
    proposal = make_suggestion()

    assert proposal.is_active_algorithm_match is True

    proposal = make_suggestion(algorithm_version=0)

    assert proposal.is_active_algorithm_match is False


def test_active_returns_only_current_version_when_both_exist(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
) -> None:
    """With proposals from two versions in the DB, .active() returns only the current one."""
    current_proposal = make_suggestion()

    other_container = make_container(cve_id="CVE-2025-9999")
    other_drv = make_drv(pname="other-pkg", attribute="other-pkg")
    outdated_proposal = make_suggestion(
        container=other_container,
        drvs={other_drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        algorithm_version=0,  # any version lower than CURRENT_ALGORITHM_VERSION
    )

    qs = CVEDerivationClusterProposal.objects.active()
    assert current_proposal in qs
    assert outdated_proposal not in qs
    assert qs.count() == 1
