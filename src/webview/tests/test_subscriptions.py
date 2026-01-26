import re
from collections.abc import Callable

from django.contrib.auth.models import User
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.listeners.notify_users import create_package_subscription_notifications
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import (
    NixDerivation,
    NixMaintainer,
)
from webview.models import Notification


def test_user_subscribes_to_valid_package_success(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    drv: NixDerivation,
    no_js: bool,
) -> None:
    """Test subscribing to an existing package and unsubscribing again"""
    as_staff.goto(live_server.url + reverse("webview:subscriptions:center"))
    subscriptions = as_staff.locator("#package-subscriptions")
    subscriptions.get_by_placeholder("Package name").fill(drv.attribute)
    empty_state = subscriptions.get_by_text(
        "You haven't subscribed to any packages yet."
    )
    expect(empty_state).to_be_visible()
    subscribe = subscriptions.get_by_role("button", name="Subscribe")
    subscribe.click()
    unsubscribe = subscriptions.filter(has_text=drv.attribute).get_by_role(
        "button", name="Unsubscribe"
    )
    if not no_js:
        # FIXME(@fricklerhandwerk): Shouldn't we always have a confirmation dialog?
        as_staff.on("dialog", lambda dialog: dialog.accept())
    unsubscribe.click()
    expect(empty_state).to_be_visible()
    expect(unsubscribe).to_have_count(0)


def test_user_subscribes_to_invalid_package_fails(
    live_server: LiveServer,
    as_staff: Page,
    no_js: bool,
) -> None:
    """Test subscription fails for non-existent package"""
    as_staff.goto(live_server.url + reverse("webview:subscriptions:center"))
    subscriptions = as_staff.locator("#package-subscriptions")
    subscriptions.get_by_placeholder("Package name").fill("nonexistent")
    subscribe = subscriptions.get_by_role("button", name="Subscribe")
    subscribe.click()

    if no_js:
        error = as_staff.locator(
            "#messages",
            has_text="does not exist",
        )
    else:
        error = subscriptions.locator(
            ".error-block",
            has_text="does not exist",
        )

    expect(error).to_be_visible()


def test_user_cannot_subscribe_to_same_package_twice(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    no_js: bool,
    drv: NixDerivation,
) -> None:
    """Test that one can't subscribe to a package twice"""
    as_staff.goto(live_server.url + reverse("webview:subscriptions:center"))
    subscriptions = as_staff.locator("#package-subscriptions")
    subscriptions.get_by_placeholder("Package name").fill(drv.attribute)
    subscribe = subscriptions.get_by_role("button", name="Subscribe", exact=True)
    subscribe.click()

    unsubscribe = subscriptions.filter(has_text=drv.attribute).get_by_role(
        "button", name="Unsubscribe"
    )
    expect(unsubscribe).to_be_visible()

    subscriptions.get_by_placeholder("Package name").fill(drv.attribute)
    subscribe.click()

    if no_js:
        error = as_staff.locator(
            "#messages",
            has_text="already subscribed",
        )
    else:
        error = subscriptions.locator(
            ".error-block",
            has_text="already subscribed",
        )
    expect(error).to_be_visible()
    expect(unsubscribe).to_be_visible()


def test_subscription_center_shows_user_subscriptions(
    make_drv: Callable[..., NixDerivation],
    live_server: LiveServer,
    as_staff: Page,
    no_js: bool,
) -> None:
    """Test that the center displays user's current subscriptions"""
    make_drv(pname="firefox")
    make_drv(pname="chromium")

    as_staff.goto(live_server.url + reverse("webview:subscriptions:center"))
    subscriptions = as_staff.locator("#package-subscriptions")
    input_field = subscriptions.get_by_placeholder("Package name")
    input_field.fill("firefox")
    subscribe = subscriptions.get_by_role("button", name="Subscribe", exact=True)
    subscribe.click()
    unsubscribe = subscriptions.get_by_role("button", name="Unsubscribe")
    expect(unsubscribe).to_have_count(1)
    input_field.fill("chromium")
    subscribe.click()
    expect(unsubscribe).to_have_count(2)


def test_subscription_center_requires_login(
    live_server: LiveServer,
    page: Page,
) -> None:
    """Test that subscription center redirects when not logged in"""
    page.goto(live_server.url + reverse("webview:subscriptions:center"))
    expect(page).to_have_url(re.compile(re.escape(reverse("account_login"))))


def test_user_receives_notification_for_subscribed_package(
    live_server: LiveServer,
    as_staff: Page,
    committer: User,
    make_maintainer_from_user: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
    make_package_notification: Callable[..., list[Notification]],
) -> None:
    """Test that users receive notifications when suggestions affect their subscribed packages"""
    drv = make_drv(maintainer=make_maintainer_from_user(committer))

    as_staff.goto(live_server.url + reverse("webview:subscriptions:center"))
    subscriptions = as_staff.locator("#package-subscriptions")
    subscriptions.get_by_placeholder("Package name").fill(drv.attribute)
    subscribe = subscriptions.get_by_role("button", name="Subscribe")
    subscribe.click()
    make_package_notification(drv)
    as_staff.goto(live_server.url + reverse("webview:notifications:center"))
    badge = as_staff.locator("#notifications-badge")
    expect(badge).to_have_text("1")


def test_user_does_not_receive_notification_when_auto_subscribe_disabled(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """Test that users do NOT receive notifications for maintained packages when auto-subscription is disabled"""
    as_staff.goto(live_server.url + reverse("webview:subscriptions:center"))
    auto_subscriptions = as_staff.locator("#maintainer-auto-subscription")
    auto_subscribe = auto_subscriptions.get_by_role("button", name="Disable")
    auto_subscribe.click()
    make_maintainer_notification(staff)
    as_staff.reload()
    badge = as_staff.locator("#notifications-badge")
    expect(badge).to_have_text("0")
    auto_subscribe = auto_subscriptions.get_by_role("button", name="Enable")
    auto_subscribe.click()
    make_maintainer_notification(staff)
    as_staff.reload()
    expect(badge).to_have_text("1")


def test_package_subscription(
    live_server: LiveServer,
    as_staff: Page,
    drv: NixDerivation,
) -> None:
    """Test that the package subscription page displays correctly for valid packages"""
    url = reverse(
        "webview:subscriptions:package", kwargs={"package_name": drv.attribute}
    )
    as_staff.goto(live_server.url + url)
    package = as_staff.locator(f"#{drv.attribute}")
    subscribe = package.get_by_role("button", name="Subscribe")
    subscribe.click()
    unsubscribe = package.get_by_role("button", name="Unsubscribe")
    unsubscribe.click()
    subscribe.click()


def test_package_subscription_invalid_name(
    live_server: LiveServer,
    as_staff: Page,
) -> None:
    """Test that the package subscription page shows error for invalid packages"""
    url = reverse(
        "webview:subscriptions:package", kwargs={"package_name": "nonexistent"}
    )
    as_staff.goto(live_server.url + url)
    main = as_staff.locator("main")
    error = main.locator(
        ".error-block",
        has_text="could not be found",
    )
    expect(error).to_be_visible()


def test_maintainer_notification_many_packages_in_suggestion(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    maintainer: NixMaintainer,
    make_user: Callable[..., User],
) -> None:
    """
    Check that many packages by one maintainer in a suggestion can be processed.
    """

    user = make_user(username=maintainer.github, uid=str(maintainer.github_id))
    drvs = {
        make_drv(
            attribute=f"package{i}", maintainer=maintainer
        ): ProvenanceFlags.PACKAGE_NAME_MATCH
        for i in range(100)
    }
    suggestion = make_suggestion(drvs=drvs)

    create_package_subscription_notifications(suggestion)

    notification = Notification.objects.first()
    assert notification
    assert notification.user == user
