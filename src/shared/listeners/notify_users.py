import logging

import pgpubsub
from django.contrib.auth.models import User

from shared.channels import CVEDerivationClusterProposalNotificationChannel
from shared.models.linkage import CVEDerivationClusterProposal
from webview.models import Profile
from webview.models import SuggestionNotification as Notification

logger = logging.getLogger(__name__)


def create_package_subscription_notifications(
    suggestion: CVEDerivationClusterProposal,
) -> list[Notification]:
    """
    Create notifications for users subscribed to packages affected by the suggestion
    and for maintainers of those packages (if they have auto-subscribe enabled).
    """

    # Query package attributes directly from the suggestion's derivations
    affected_packages = list(
        suggestion.derivations.values_list("attribute", flat=True).distinct()
    )
    cve_id = suggestion.cve.cve_id

    if not affected_packages:
        logger.debug(f"No packages found for suggestion {suggestion.pk}")
        return []

    # Find users subscribed to ANY of these packages
    subscribed_users_qs = User.objects.filter(
        profile__package_subscriptions__overlap=affected_packages
    ).select_related("profile")
    subscribed_users_set = set(subscribed_users_qs)

    # Find maintainers of affected packages with auto-subscribe enabled
    maintainer_users_qs = (
        User.objects.filter(
            username__in=suggestion.derivations.filter(
                metadata__maintainers__isnull=False
            ).values_list("metadata__maintainers__github", flat=True),
            profile__auto_subscribe_to_maintained_packages=True,
        )
        .select_related("profile")
        .distinct()
    )

    maintainer_users = set(maintainer_users_qs)

    logger.debug(
        f"Found {len(maintainer_users)} maintainers with auto-subscribe enabled for suggestion {suggestion.pk}"
    )

    # Combine both sets of users, avoiding duplicates
    all_users_to_notify = subscribed_users_set | maintainer_users

    logger.debug(f"About to notify users about packages: {affected_packages}")
    logger.debug(f"Users to notify: {all_users_to_notify}")

    logger.info(
        f"Creating notifications for {len(all_users_to_notify)} users for CVE {cve_id} "
        f"({len(subscribed_users_set)} subscribed, {len(maintainer_users)} maintainers)"
    )

    notifications = []
    for user in all_users_to_notify:
        try:
            notification = Profile.objects.get(user=user).create_notification(
                suggestion=suggestion,
            )
            notifications.append(notification)
            logger.debug(f"Created notification for user {user.username}")
        except Exception as e:
            logger.error(f"Failed to create notification for user {user.username}: {e}")
    return notifications


@pgpubsub.post_insert_listener(CVEDerivationClusterProposalNotificationChannel)
def notify_subscribed_users_following_suggestion_insert(
    old: CVEDerivationClusterProposal, new: CVEDerivationClusterProposal
) -> None:
    """
    Notify users subscribed to packages when a new security suggestion is created.
    """
    try:
        create_package_subscription_notifications(new)
    except Exception as e:
        logger.error(
            f"Failed to create package subscription notifications for suggestion {new.pk}: {e}"
        )
