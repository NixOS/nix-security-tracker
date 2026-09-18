from collections.abc import Callable
from unittest import mock

import pytest
from django.db import transaction

from shared.cache_suggestions import cache_new_suggestions
from shared.listeners.automatic_linkage import refresh_suggestion_derivation_links
from shared.listeners.package_clustering import (
    cluster_after_evaluation,
    refresh_and_cache_suggestion,
)
from shared.models.cached import CachedSuggestions
from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixDerivation,
    NixEvaluation,
)


@pytest.fixture
def mock_cluster_after_evaluation_trigger() -> Callable[..., list[int]]:
    """Run the post-evaluation handler and capture suggestions triggered for link refreshing"""

    def run(old: NixEvaluation, new: NixEvaluation) -> list[int]:
        with mock.patch(
            "shared.listeners.package_clustering.pgpubsub.notify"
        ) as mock_notify:
            with transaction.atomic():
                cluster_after_evaluation(old=old, new=new)
        return [call.kwargs["pk"] for call in mock_notify.call_args_list]

    return run


@pytest.fixture
def cluster_and_process_refreshes(
    mock_cluster_after_evaluation_trigger: Callable[..., list[int]],
) -> Callable[..., None]:
    """Recreates how the notifications following the package clustering are processed"""

    def run(old: NixEvaluation, new: NixEvaluation) -> None:
        for pk in mock_cluster_after_evaluation_trigger(old=old, new=new):
            with transaction.atomic():
                refresh_and_cache_suggestion(pk=pk)

    return run


@pytest.mark.django_db(transaction=True)
def test_cache_rebuilt_after_clustering(
    cve: Container,
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    cluster_and_process_refreshes: Callable[..., None],
) -> None:
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    make_drv(pname="foo", evaluation=new_eval, attribute=old_drv.attribute)

    suggestion = make_suggestion(
        container=cve, drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    cache_new_suggestions(suggestion)
    cached_before = CachedSuggestions.objects.get(proposal=suggestion)

    cluster_and_process_refreshes(
        old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
        new=new_eval,
    )

    cached_after = CachedSuggestions.objects.get(proposal=suggestion)
    assert cached_after.updated_at > cached_before.updated_at


@pytest.mark.django_db(transaction=True)
@pytest.mark.parametrize(
    "status",
    [
        CVEDerivationClusterProposal.Status.REJECTED,
        CVEDerivationClusterProposal.Status.PUBLISHED,
    ],
)
def test_only_pending_and_accepted_suggestions_updated(
    status: CVEDerivationClusterProposal.Status,
    cve: Container,
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    cluster_and_process_refreshes: Callable[..., None],
) -> None:
    """Only PENDING and ACCEPTED suggestions have their derivation links refreshed; REJECTED and PUBLISHED are skipped."""
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    make_drv(pname="foo", evaluation=new_eval, attribute=old_drv.attribute)

    suggestion = make_suggestion(
        container=cve,
        drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=status,
    )

    cluster_and_process_refreshes(
        old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
        new=new_eval,
    )

    link = DerivationClusterProposalLink.objects.get(proposal=suggestion)
    assert link.derivation == old_drv


@pytest.mark.django_db(transaction=True)
def test_multiple_suggestions_all_refreshed(
    make_container: Callable[..., Container],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    cluster_and_process_refreshes: Callable[..., None],
) -> None:
    """
    All affected suggestions get their caches rebuilt, not just the first one.
    """
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    test_data = []
    for i in range(3):
        container = make_container(cve_id=f"CVE-2025-100{i}", package_name=f"foo{i}")
        old_drv = make_drv(pname=f"foo{i}", evaluation=old_eval)
        new_drv = make_drv(
            pname=f"foo{i}", evaluation=new_eval, attribute=old_drv.attribute
        )
        suggestion = make_suggestion(
            container=container, drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
        )
        cache_new_suggestions(suggestion)
        test_data.append((CachedSuggestions.objects.get(proposal=suggestion), new_drv))

    cluster_and_process_refreshes(
        old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
        new=new_eval,
    )

    for cached_before, new_drv in test_data:
        cached_after = CachedSuggestions.objects.get(proposal=cached_before.proposal)
        assert cached_after.updated_at > cached_before.updated_at
        assert cached_after.proposal.derivations.get() == new_drv


@pytest.mark.django_db(transaction=True)
def test_suggestion_refresh_failure_does_not_block_others(
    make_container: Callable[..., Container],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    mock_cluster_after_evaluation_trigger: Callable[..., list[int]],
) -> None:
    """
    One suggestion's refresh raising doesn't prevent the others from succeeding.
    Each dispatched suggestion is processed independently.
    So there's no shared batch for one failure to take down.
    """
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    suggestions = []
    old_drvs = {}
    new_drvs = {}
    for i in range(3):
        container = make_container(cve_id=f"CVE-2025-300{i}", package_name=f"foo{i}")
        old_drv = make_drv(pname=f"foo{i}", evaluation=old_eval)
        new_drv = make_drv(
            pname=f"foo{i}", evaluation=new_eval, attribute=old_drv.attribute
        )
        suggestion = make_suggestion(
            container=container, drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
        )
        cache_new_suggestions(suggestion)
        suggestions.append(suggestion)
        old_drvs[suggestion.pk] = old_drv
        new_drvs[suggestion.pk] = new_drv

    failing_pk = suggestions[0].pk

    def maybe_fail(suggestion: CVEDerivationClusterProposal) -> None:
        if suggestion.pk == failing_pk:
            raise RuntimeError("simulated failure")
        refresh_suggestion_derivation_links(suggestion)

    cached_befores = {
        s.pk: CachedSuggestions.objects.get(proposal=s).updated_at for s in suggestions
    }

    pks = mock_cluster_after_evaluation_trigger(
        old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
        new=new_eval,
    )
    assert set(pks) == {s.pk for s in suggestions}

    with mock.patch(
        "shared.listeners.package_clustering.refresh_suggestion_derivation_links",
        new=maybe_fail,
    ):
        for pk in pks:
            with transaction.atomic():
                if pk == failing_pk:
                    with pytest.raises(RuntimeError, match="simulated failure"):
                        refresh_and_cache_suggestion(pk=pk)
                else:
                    refresh_and_cache_suggestion(pk=pk)

    for suggestion in suggestions:
        cached_after = CachedSuggestions.objects.get(proposal=suggestion)
        if suggestion.pk == failing_pk:
            assert cached_after.updated_at == cached_befores[suggestion.pk]
            assert cached_after.proposal.derivations.get() == old_drvs[suggestion.pk]
        else:
            assert cached_after.updated_at > cached_befores[suggestion.pk]
            assert cached_after.proposal.derivations.get() == new_drvs[suggestion.pk]


@pytest.mark.django_db(transaction=True)
def test_refresh_skips_published_suggestion_on_match(
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    mock_cluster_after_evaluation_trigger: Callable[..., list[int]],
) -> None:
    """
    When a suggestion is published while refresh is running, its derivation links
    must not be replaced even when newer matching derivations exist.
    """
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    make_drv(pname="foo", evaluation=new_eval, attribute=old_drv.attribute)

    suggestion = make_suggestion(drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH})

    pks = mock_cluster_after_evaluation_trigger(
        old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
        new=new_eval,
    )

    # Suggestion was published between notification dispatch and processing.
    suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
    suggestion.save(update_fields=["status"])
    suggestion.status = CVEDerivationClusterProposal.Status.PUBLISHED
    suggestion.save(update_fields=["status"])

    for pk in pks:
        with transaction.atomic():
            refresh_and_cache_suggestion(pk=pk)

    link = DerivationClusterProposalLink.objects.get(proposal=suggestion)
    assert link.derivation == old_drv


@pytest.mark.django_db(transaction=True)
def test_refresh_skips_published_suggestion_on_rejection(
    evaluation: NixEvaluation,
    suggestion: CVEDerivationClusterProposal,
    mock_cluster_after_evaluation_trigger: Callable[..., list[int]],
) -> None:
    """
    When a suggestion is published while refresh is running, the status must not
    be overwritten to REJECTED and its links must not be deleted.
    """

    pks = mock_cluster_after_evaluation_trigger(
        old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
        new=evaluation,
    )

    # Suggestion was published between notification dispatch and processing.
    suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
    suggestion.save(update_fields=["status"])
    suggestion.status = CVEDerivationClusterProposal.Status.PUBLISHED
    suggestion.save(update_fields=["status"])

    for pk in pks:
        with transaction.atomic():
            refresh_and_cache_suggestion(pk=pk)

    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.PUBLISHED
    assert DerivationClusterProposalLink.objects.filter(proposal=suggestion).exists()


@pytest.mark.django_db(transaction=True)
def test_suggestion_refresh_skipped_when_transaction_rolls_back(
    cve: Container,
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    make_drv(pname="foo", evaluation=new_eval, attribute=old_drv.attribute)

    make_suggestion(container=cve, drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH})

    fail_later_in_transaction = mock.Mock(
        side_effect=RuntimeError(
            "simulate a later failure in the same pgpubsub transaction"
        )
    )

    with (
        mock.patch(
            "shared.listeners.package_clustering.pgpubsub.notify"
        ) as mock_pgnotify,
        pytest.raises(RuntimeError),
        transaction.atomic(),
    ):
        cluster_after_evaluation(
            old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
            new=new_eval,
        )
        fail_later_in_transaction()

    mock_pgnotify.assert_not_called()
