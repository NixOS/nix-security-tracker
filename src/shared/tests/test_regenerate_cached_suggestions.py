from collections.abc import Callable
from io import StringIO

import pytest
from django.core.management import call_command

from shared.models.cached import CachedSuggestions
from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixDerivation

_OUTDATED_VERSION: int = (
    CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION - 1  # type: ignore[operator]
)


@pytest.mark.parametrize(
    "status, algorithm_version, cache_exists",
    [
        (CVEDerivationClusterProposal.Status.PENDING, _OUTDATED_VERSION, False),
        (CVEDerivationClusterProposal.Status.ACCEPTED, _OUTDATED_VERSION, True),
        (CVEDerivationClusterProposal.Status.REJECTED, _OUTDATED_VERSION, True),
        (
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
            True,
        ),
    ],
)
def test_regenerate_cache_for_suggestions_with_no_existing_cache(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    status: str,
    algorithm_version: int,
    cache_exists: bool,
) -> None:
    suggestion = make_suggestion(
        status=status,
        algorithm_version=algorithm_version,
    )

    call_command("regenerate_cached_suggestions", stdout=StringIO())

    assert (
        CachedSuggestions.objects.filter(proposal=suggestion).exists() is cache_exists
    )


@pytest.mark.parametrize(
    "status, algorithm_version, after_schema_version",
    [
        (
            CVEDerivationClusterProposal.Status.PENDING,
            _OUTDATED_VERSION,
            CachedSuggestions.CURRENT_SCHEMA_VERSION - 1,  # type: ignore
        ),
        (
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
            CachedSuggestions.CURRENT_SCHEMA_VERSION,
        ),
        (
            CVEDerivationClusterProposal.Status.ACCEPTED,
            CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
            CachedSuggestions.CURRENT_SCHEMA_VERSION,
        ),
        (
            CVEDerivationClusterProposal.Status.REJECTED,
            CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
            CachedSuggestions.CURRENT_SCHEMA_VERSION,
        ),
    ],
)
def test_regenerate_cache_command_for_stale_cache(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    status: str,
    algorithm_version: int,
    after_schema_version: int,
) -> None:
    """Default mode writes schema_version=CURRENT_SCHEMA_VERSION when regenerating a stale
    cache for a current-version PENDING proposal."""
    stale_version = CachedSuggestions.CURRENT_SCHEMA_VERSION - 1  # type: ignore
    proposal = make_cached_suggestion(
        status=status, algorithm_version=algorithm_version
    )
    CachedSuggestions.objects.filter(proposal=proposal).update(
        schema_version=stale_version
    )

    before = CachedSuggestions.objects.get(proposal=proposal)
    assert before.schema_version == stale_version

    call_command("regenerate_cached_suggestions", stdout=StringIO())

    after = CachedSuggestions.objects.get(proposal=proposal)
    assert after.schema_version == after_schema_version


def test_regenerate_cache_command_purges_all_caches(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
) -> None:
    """--all mode deletes every existing CachedSuggestions row before regenerating."""
    pending_proposal = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    accepted_outdated = make_cached_suggestion(
        container=make_container(cve_id="CVE-2025-3001"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=_OUTDATED_VERSION,
    )
    pending_outdated = make_cached_suggestion(
        container=make_container(cve_id="CVE-2025-4001"),
        status=CVEDerivationClusterProposal.Status.PENDING,
        algorithm_version=_OUTDATED_VERSION,
    )
    assert CachedSuggestions.objects.count() == 3

    call_command("regenerate_cached_suggestions", "--all", stdout=StringIO())

    assert not CachedSuggestions.objects.filter(proposal=pending_outdated).exists()
    assert CachedSuggestions.objects.filter(
        proposal__in=[accepted_outdated, pending_proposal]
    ).exists()
