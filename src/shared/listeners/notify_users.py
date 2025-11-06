import logging

import pgpubsub
from django.contrib.auth.models import User

from shared.channels import CVEDerivationClusterProposalNotificationChannel
from shared.models.linkage import CVEDerivationClusterProposal
from webview.models import Notification

logger = logging.getLogger(__name__)


def create_package_subscription_notifications(
    suggestion: CVEDerivationClusterProposal,
) -> None:
    """
    Create notifications for users subscribed to packages affected by the suggestion
    and for maintainers of those packages (if they have auto-subscribe enabled).
    """

    # Query package attributes directly from the suggestion's derivations
    affected_packages = list(
        suggestion.derivations.values_list("attribute", flat=True).distinct()
    )
    cve_id = suggestion.cve.cve_id

    # Query maintainers' GitHub usernames directly from the derivations' metadata
    maintainers_github = list(
        suggestion.derivations.filter(metadata__maintainers__isnull=False)
        .values_list("metadata__maintainers__github", flat=True)
        .distinct()
    )

    if not affected_packages:
        logger.debug(f"No packages found for suggestion {suggestion.pk}")
        return

    # Find users subscribed to ANY of these packages
    subscribed_users = User.objects.filter(
        profile__package_subscriptions__overlap=affected_packages
    ).select_related("profile")

    # Find maintainers of affected packages from cached suggestion
    maintainer_users = set()
    if maintainers_github:
        maintainer_users = set(
            User.objects.filter(
                username__in=maintainers_github,
                profile__auto_subscribe_to_maintained_packages=True,
            ).select_related("profile")
        )

        logger.debug(
            f"Found {len(maintainer_users)} maintainers with auto-subscribe enabled for suggestion {suggestion.pk}"
        )

    # Combine both sets of users, avoiding duplicates
    all_users_to_notify = set(subscribed_users) | maintainer_users

    logger.debug(f"About to notify users about packages: {affected_packages}")
    logger.debug(f"Users to notify: {all_users_to_notify}")

    logger.info(
        f"Creating notifications for {len(all_users_to_notify)} users for CVE {cve_id} "
        f"({len(subscribed_users)} subscribed, {len(maintainer_users)} maintainers)"
    )

    for user in all_users_to_notify:
        # Determine notification reason and affected packages for this user
        user_affected_packages = []
        notification_reason = []

        # Check if user is subscribed to any affected packages
        if user in subscribed_users:
            user_subscribed_packages = [
                pkg
                for pkg in user.profile.package_subscriptions
                if pkg in affected_packages
            ]
            user_affected_packages.extend(user_subscribed_packages)
            if user_subscribed_packages:
                notification_reason.append("subscribed to")

        # Check if user is a maintainer with auto-subscribe enabled
        if user in maintainer_users:
            # For maintainers, all affected packages are relevant
            maintainer_packages = [
                pkg for pkg in affected_packages if pkg not in user_affected_packages
            ]
            user_affected_packages.extend(maintainer_packages)
            if maintainer_packages or (user not in subscribed_users):
                notification_reason.append("maintainer of")

        if not user_affected_packages:
            continue

        # Create notification
        try:
            reason_text = " and ".join(notification_reason)
            Notification.objects.create_for_user(
                user=user,
                title=f"New security suggestion affects: {', '.join(user_affected_packages)}",
                message=f"CVE {cve_id} may affect packages you're {reason_text}. "
                f"Affected packages: {', '.join(user_affected_packages)}. ",
            )
            logger.debug(
                f"Created notification for user {user.username} ({reason_text}) for packages: {user_affected_packages}"
            )
        except Exception as e:
            logger.error(f"Failed to create notification for user {user.username}: {e}")


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
