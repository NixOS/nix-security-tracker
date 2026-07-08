import logging

import pgpubsub

from shared.cache_suggestions import cache_new_suggestions
from shared.channels import NixEvaluationUpdateChannel
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

    affected_suggestions = CVEDerivationClusterProposal.objects.filter(
        derivations__parent_evaluation__channel=evaluation.channel,
        status__in=[
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.ACCEPTED,
        ],
    ).distinct()

    count = 0
    for suggestion in affected_suggestions:
        refresh_suggestion_derivation_links(suggestion)
        cache_new_suggestions(suggestion)
        count += 1

    if count:
        logger.info(
            "Updated derivation links and rebuilt caches for %d suggestion(s) after evaluation %s",
            count,
            evaluation,
        )
