import logging

import pgpubsub

from shared.channels import NixEvaluationUpdateChannel
from shared.models import NixDerivation, NixEvaluation
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
        update_packages=evaluation.channel.is_rolling_release,
    )
    logger.info(
        f"Done. Clustered {result.derivations_processed} derivations: "
        f"updated {result.packages_updated}, created {result.packages_created} pacakges, "
        f"updated {result.attrpaths_updated}, created {result.attrpaths_created} attrpaths."
    )
