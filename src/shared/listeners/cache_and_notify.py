import logging

import pgpubsub

from shared.cache_suggestions import cache_new_suggestions
from shared.channels import CVEDerivationClusterProposalChannel
from shared.models.linkage import CVEDerivationClusterProposal
from shared.notify_users import create_package_subscription_notifications

logger = logging.getLogger(__name__)


@pgpubsub.post_insert_listener(CVEDerivationClusterProposalChannel)
def cache_new_suggestions_following_new_container(
    old: CVEDerivationClusterProposal, new: CVEDerivationClusterProposal
) -> None:
    logger.info(f"Cache and notify for suggestion {new.pk}")
    # Generate cached value suggestion for only current algorithm
    if new.is_active_algorithm_match:
        cache_new_suggestions(new)
        try:
            create_package_subscription_notifications(new)
        except Exception as e:
            logger.error(
                f"Failed to create package subscription notifications for suggestion {new.pk}: {e}"
            )
