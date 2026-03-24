from dataclasses import dataclass

from webview.models import Notification, Profile, SuggestionNotification
from webview.suggestions.context.types import SuggestionStubContext


@dataclass
class NotificationContext:
    new_unread_count: int | None  # For oob update of unread notifications counter
    current_page: (
        int | None
    )  # For no-js compatibility in multi-page notification center
    notification: Notification
    suggestion_stub_context: SuggestionStubContext | None = None
    matching_subscribed_packages: dict | None = None
    matching_maintained_packages: dict | None = None

    def __init__(
        self,
        notification: Notification,
        user_profile: Profile,
        new_unread_count: int | None = None,
        current_page: int | None = None,
    ) -> None:
        self.notification = notification
        self.new_unread_count = new_unread_count
        self.current_page = current_page
        if isinstance(notification, SuggestionNotification):
            self.suggestion_stub_context = SuggestionStubContext(
                suggestion=notification.suggestion,
                issue_link=None,
                undo_status_target=None,
                undo_rejection_reason=None,
            )
            self.matching_subscribed_packages = self._get_matching_subscribed_packages(
                user_profile
            )
            self.matching_maintained_packages = self._get_matching_maintained_packages(
                user_profile
            )

    def _get_matching_subscribed_packages(self, user_profile: Profile) -> dict:
        # FIXME(@florentc): Since notifications cannot be automatically deleted
        # in response to some events yet, the current implementation has 2
        # unavoidable quirks:
        #
        # 1. The user can receive a notification because they suscribed to a
        # package. If they then unsubscribe, the notification will still be
        # here but the matching package will no longer be displayed as such in
        # the notification.
        #
        # 2. If at some point the package is ignored within the suggestion,
        # then it won't appear in the list of matched packages in the
        # notification. Once again, we may end up with notification that
        # seemingly match nothing of interest. Another implementation choice is
        # to check "original_packages" instead of "packages", which is the list
        # of packages auto-matched initially, before anybody might have ignored
        # some packages.
        suggestion_packages = self.notification.suggestion.cached.payload.get(
            "packages", {}
        )

        # Filter by user's manual subscriptions
        subscribed_attrs = set(user_profile.package_subscriptions)
        return {
            attr: pdata
            for attr, pdata in suggestion_packages.items()
            if attr in subscribed_attrs
        }

    def _get_matching_maintained_packages(self, user_profile: Profile) -> dict:
        suggestion_packages = self.notification.suggestion.cached.payload.get(
            "packages", {}
        )

        # FIXME(@florentc): Not all users in db seem to have a github_id so
        # matching is done by username here instead. It turns out it is also
        # how matching is done to generate the notification in the first place.
        username = user_profile.user.username

        # Filter packages where the user is a maintainer
        # NOTE(@florentc): We populate this list regardless of whether the user
        # has enabled "notify about packages I maintain". In case the user is
        # notified about a package they otherwise subscribe to, it is still
        # relevant to show them they also maintain some related packages.
        matching_packages = {
            attr: pdata
            for attr, pdata in suggestion_packages.items()
            if any(
                maintainer.get("github") == username
                for maintainer in pdata.get("maintainers", [])
            )
        }

        return matching_packages
