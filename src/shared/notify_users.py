import logging
from urllib.parse import urljoin

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.defaultfilters import truncatewords
from django.urls import reverse

from shared.models.linkage import CVEDerivationClusterProposal
from webview.models import Profile
from webview.models import SuggestionNotification as Notification
from webview.notifications.context import NotificationContext

logger = logging.getLogger(__name__)


def create_package_subscription_notifications(
    suggestion: CVEDerivationClusterProposal,
) -> list[Notification]:
    """
    Create notifications for users subscribed to packages affected by the suggestion
    and for maintainers of those packages (if they have auto-subscribe enabled).
    """

    # FIXME(@florentc): These queries are no longer related. We should use the
    # cached suggestions when possible. This was done back when notifying could
    # happen before caching.

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
    github_ids = [
        str(s)
        for s in suggestion.derivations.filter(
            metadata__maintainers__isnull=False
        ).values_list("metadata__maintainers__github_id", flat=True)
    ]
    maintainer_users_qs = (
        User.objects.filter(
            socialaccount__provider="github",
            socialaccount__uid__in=github_ids,
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

            # Send email notification if enabled
            try:
                send_notification_email(user, notification)
            except Exception as e:
                logger.error(
                    f"Failed to send email notification to user {user.username}: {e}"
                )

        except Exception as e:
            logger.error(f"Failed to create notification for user {user.username}: {e}")
    return notifications


def send_notification_email(user: User, notification: Notification) -> None:
    """Send an email notification to a user about a new CVE suggestion."""
    if not (user.profile.receive_email_notifications):
        return

    email = (
        user.profile.notification_email
        if user.profile.notification_email
        else (user.profile.maintainer.email if user.profile.maintainer else None)
    )

    if not email:
        logger.info(f"Could not send email notification to {user.username}: no address")
        return

    # Reuse existing notification rendering logic
    context = NotificationContext(notification=notification, user_profile=user.profile)

    suggestion = notification.suggestion
    subject = f"Nixpkgs security notification: {suggestion.cve.cve_id}"

    cve_title = None
    if suggestion.cached.payload["title"]:
        cve_title = suggestion.cached.payload["title"]
    elif suggestion.cached.payload["description"]:
        cve_title = truncatewords(suggestion.cached.payload["description"], 10)

    message_parts = [
        f"Hello{' ' + user.profile.maintainer.github if user.profile.maintainer and user.profile.maintainer.github else ''},",
        "",
        "A vulnerability may affect packages you follow or maintain:",
        "",
        f"CVE: {suggestion.cve.cve_id}",
        f"Object: {cve_title}",
        f"Details: {urljoin(str(settings.BASE_URL), reverse('webview:suggestion:detail', kwargs={'suggestion_id': suggestion.pk}))}",
        "",
    ]

    if suggestion.cached and suggestion.cached.payload.get("affected_products"):
        affected_products = suggestion.cached.payload["affected_products"]
        if affected_products:
            message_parts.extend(
                [
                    "Affected products:",
                ]
            )
            for package_name, ap in affected_products.items():
                version_info = []
                for status, vc_str in ap.get("version_constraints", []):
                    if status == "unaffected":
                        version_info.append(f"{vc_str} (unaffected)")
                    else:
                        version_info.append(vc_str)

                if version_info:
                    message_parts.append(
                        f"  - {package_name}: {', '.join(version_info)}"
                    )
                else:
                    message_parts.append(f"  - {package_name}")

            message_parts.append("")

    if context.matching_subscribed_packages:
        message_parts.extend(
            [
                "Packages you follow that may be affected:",
                *[f"  - {pkg}" for pkg in context.matching_subscribed_packages.keys()],
                "",
            ]
        )

    if context.matching_maintained_packages:
        message_parts.extend(
            [
                "Packages you maintain that may be affected:",
                *[f"  - {pkg}" for pkg in context.matching_maintained_packages.keys()],
                "",
            ]
        )

    message_parts.extend(
        [
            f"View all notifications: {urljoin(str(settings.BASE_URL), reverse('webview:notifications:center'))}",
            f"Manage email notification preferences: {urljoin(str(settings.BASE_URL), reverse('webview:subscriptions:center'))}",
        ]
    )

    send_mail(
        subject=subject,
        message="\n".join(message_parts),
        from_email=None,  # Use default
        recipient_list=[email],
        fail_silently=False,
    )
    logger.info(f"Email notification sent to user id {user.pk}")
