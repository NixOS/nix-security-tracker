from typing import Any

from django.contrib.auth.models import User
from django.contrib.postgres import fields
from django.db import models, transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from model_utils.managers import InheritanceManager

from shared.models import TimeStampMixin
from shared.models.linkage import CVEDerivationClusterProposal


class Notification(TimeStampMixin):
    """
    Notification to appear in the notification center of a user.
    """

    objects = InheritanceManager()

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    is_read = models.BooleanField(default=False)

    def toggle_read(self) -> int:
        """
        Toggle a notification's read status and update user's unread counter.

        Returns the new unread counter.
        """
        profile = self.user.profile
        with transaction.atomic():
            self.is_read = not self.is_read
            self.save(update_fields=["is_read"])

            # FIXME(@fricklerhandwerk): [tag:count-notifications]: We may want to simply `.count()` on every full page instead of risking permanent inconsistency arising from unforseen edge cases.
            # The rationale by @florentc for denormalising was a performance consideration, but
            # - the difference will likely not be noticeable with <100 users
            # - it needs measurement in any case
            # - may resolve itself eventually as we increasingly avoid page reloads
            if not self.is_read:
                profile.unread_notifications_count += 1
            else:
                profile.unread_notifications_count = max(
                    0, profile.unread_notifications_count - 1
                )
            profile.save(update_fields=["unread_notifications_count"])

        return profile.unread_notifications_count


class TextNotification(Notification):
    # FIXME(@fricklerhandwerk): Generate suggestion status change notification text in the view. [ref:suggestion-notification-text]
    title = models.CharField(max_length=255, blank=False)
    message = models.TextField()


class SuggestionNotification(Notification):
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        # XXX(@fricklerhandwerk): It's unlikely we'll delete suggestions any time soon.
        # But when we do, we don't want to mess up the notification counter. [ref:count-notifications]
        on_delete=models.PROTECT,
    )

    @property
    def title(self) -> str:
        # XXX(@fricklerhandwerk): This is hard to be more precise about without tracking or carefully extracting more data.
        # Ideally we'd always say the matching was automatic, and also why it happened.
        # For example, show the package that corresponds to subscribed attribute name or auto-subscription by maintainer.
        # But a suggestion can be edited after the match was made and the notification created.
        # We should then also show (maybe in the equivalent of the text message) what state that match is now in (e.g. ingored, ideally for which reason).
        # Maybe even garbage-collect the notification if it got obsolete and wasn't yet served or otherwise exposed to the user.
        # FIXME(@fricklerhandwerk): User-facing text should be generated from structured data in templates.
        return f"{self.suggestion.cve.cve_id} was automatically matched to packages you subscribed to"


class Profile(models.Model):
    """
    Profile associated to a user, storing extra non-auth-related data such as
    active issue subscriptions.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    unread_notifications_count = models.PositiveIntegerField(default=0)
    package_subscriptions = fields.ArrayField(
        models.CharField(max_length=255),
        default=list,
        blank=True,
        help_text="Package attribute names this user has subscribed to manually (e.g., 'firefox', 'chromium')",
    )
    auto_subscribe_to_maintained_packages = models.BooleanField(
        default=True,
        help_text="Automatically subscribe to notifications for packages this user maintains",
    )

    def create_notification(
        self, suggestion: CVEDerivationClusterProposal
    ) -> SuggestionNotification:
        """Create a notification and update the user's unread counter."""
        notification = SuggestionNotification.objects.create(
            user=self.user,
            suggestion=suggestion,
        )

        self.unread_notifications_count += 1
        self.save(update_fields=["unread_notifications_count"])

        return notification

    def mark_all_read_for_user(self) -> int:
        """Mark all notifications as read for a user and reset counter. Returns count of notifications marked."""
        unread = Notification.objects.filter(user=self.user, is_read=False)
        unread_count = unread.count()

        if unread_count > 0:
            unread.update(is_read=True)

            self.unread_notifications_count = 0
            self.save(update_fields=["unread_notifications_count"])

        return unread_count

    def clear_read_for_user(self) -> int:
        """Delete all read notifications for a user. Counter should remain unchanged."""
        read = Notification.objects.filter(user=self.user, is_read=True)
        count = read.count()

        if count > 0:
            read.delete()

        return count


@receiver(post_save, sender=User)
def create_profile(
    sender: type[User], instance: User, created: bool, **kwargs: Any
) -> None:
    if created:
        Profile.objects.create(user=instance)
