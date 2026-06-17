import logging

import pgpubsub
from django.db import transaction

from shared.cache_suggestions import cache_new_suggestions
from shared.channels import NixEvaluationUpdateChannel, SuggestionRefreshChannel
from shared.listeners.automatic_linkage import refresh_suggestion_derivation_links
from shared.models import NixDerivation, NixEvaluation
from shared.models.linkage import CVEDerivationClusterProposal
from shared.package_clustering import cluster_packages

logger = logging.getLogger(__name__)


@pgpubsub.post_update_listener(NixEvaluationUpdateChannel)
def cluster_after_evaluation(old: NixEvaluation, new: NixEvaluation) -> None:
    if old.state == new.state:
        return
    if new.state != NixEvaluation.EvaluationState.COMPLETED:
        return
    evaluation = NixEvaluation.objects.select_related("channel").get(pk=new.pk)
    logger.info("Clustering derivations from evaluation %s", evaluation)
    result = cluster_packages(
        NixDerivation.objects.filter(parent_evaluation_id=new.pk),
        update_packages=evaluation.channel.is_tracking_branch,
    )
    logger.info(
        f"Done. Clustered {result.derivations_processed} derivations: "
        f"updated {result.packages_updated}, created {result.packages_created} packages, "
        f"updated {result.attrpaths_updated}, created {result.attrpaths_created} attrpaths."
    )

    # Schedules a refresh of derivation links and suggestion caches for every
    # suggestion affected by this evaluation's clustering.
    channel_id = evaluation.channel_id

    def _run_after_commit() -> None:
        suggestion_pks = (
            CVEDerivationClusterProposal.objects.filter(
                derivations__parent_evaluation__channel_id=channel_id,
                status__in=[
                    CVEDerivationClusterProposal.Status.PENDING,
                    CVEDerivationClusterProposal.Status.ACCEPTED,
                ],
            )
            .distinct()
            .values_list("pk", flat=True)
        )

        for pk in suggestion_pks:
            pgpubsub.notify(SuggestionRefreshChannel, pk=pk)

    transaction.on_commit(_run_after_commit)


@pgpubsub.listener(SuggestionRefreshChannel)
def refresh_and_cache_suggestion(pk: int) -> None:
    """
    Refresh derivation links, then rebuild the cache, in that order, since
    caching depends on the refreshed links.
    """
    try:
        with transaction.atomic():
            suggestion = CVEDerivationClusterProposal.objects.select_for_update().get(
                pk=pk,
                status__in=[
                    CVEDerivationClusterProposal.Status.PENDING,
                    CVEDerivationClusterProposal.Status.ACCEPTED,
                ],
            )
            refresh_suggestion_derivation_links(suggestion)
            cache_new_suggestions(suggestion)
    except CVEDerivationClusterProposal.DoesNotExist:
        # We don't want to try again! If we crash here, the work is put back on the queue.
        logger.info("Suggestion %d no longer pending/accepted, skipping refresh", pk)
