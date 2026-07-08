from collections.abc import Callable

from playwright.sync_api import Locator, Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.nix_evaluation import NixDerivation
from shared.models.package import Package

from .routes import USER_SETTINGS_SUBSCRIPTIONS

PACKAGE_SUBSCRIPTIONS_HEADING = "Additional packages"


def _get_section(page: Page) -> Locator:
    return page.get_by_role("heading", name=PACKAGE_SUBSCRIPTIONS_HEADING).locator(
        "xpath=.."
    )


def test_subscribe_valid_package(
    live_server: LiveServer,
    as_staff: Page,
    drv: NixDerivation,
    package: Package,
) -> None:
    """Subscribing to a valid package shows it in the list."""
    as_staff.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)
    as_staff.get_by_placeholder("Package name").fill(drv.attribute)
    as_staff.get_by_role("button", name="Subscribe", exact=True).click()
    expect(as_staff.get_by_text(drv.attribute)).to_be_visible()
    expect(as_staff.get_by_role("button", name="Unsubscribe")).to_be_visible()


def test_subscribe_invalid_package_shows_error(
    live_server: LiveServer,
    as_staff: Page,
) -> None:
    """Subscribing to a non-existent package shows an error."""
    as_staff.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)
    as_staff.get_by_placeholder("Package name").fill("nonexistent-package")
    as_staff.get_by_role("button", name="Subscribe", exact=True).click()
    expect(as_staff.get_by_text("does not exist", exact=False)).to_be_visible()
    expect(as_staff.get_by_role("button", name="Unsubscribe")).to_have_count(0)


def test_subscribe_duplicate_shows_error(
    live_server: LiveServer,
    as_staff: Page,
    drv: NixDerivation,
    package: Package,
) -> None:
    """Subscribing to an already-subscribed package shows an error."""
    as_staff.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)
    as_staff.get_by_placeholder("Package name").fill(drv.attribute)
    as_staff.get_by_role("button", name="Subscribe", exact=True).click()
    expect(as_staff.get_by_text(drv.attribute)).to_be_visible()

    # Try to subscribe again
    as_staff.get_by_placeholder("Package name").fill(drv.attribute)
    as_staff.get_by_role("button", name="Subscribe", exact=True).click()
    expect(as_staff.get_by_text("already subscribed", exact=False)).to_be_visible()
    # Still only one entry
    expect(as_staff.get_by_role("button", name="Unsubscribe")).to_have_count(1)


def test_multiple_subscriptions_shown(
    live_server: LiveServer,
    as_staff: Page,
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    """Multiple subscribed packages all appear in the list."""
    drv1 = make_drv(pname="firefox", attribute="firefox")
    drv2 = make_drv(pname="chromium", attribute="chromium")
    make_package(drv1)
    make_package(drv2)
    as_staff.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)
    input_field = as_staff.get_by_placeholder("Package name")
    subscribe = as_staff.get_by_role("button", name="Subscribe", exact=True)

    input_field.fill(drv1.attribute)
    subscribe.click()
    expect(as_staff.get_by_role("button", name="Unsubscribe")).to_have_count(1)

    input_field.fill(drv2.attribute)
    subscribe.click()
    expect(as_staff.get_by_role("button", name="Unsubscribe")).to_have_count(2)
    expect(as_staff.get_by_text(drv1.attribute)).to_be_visible()
    expect(as_staff.get_by_text(drv2.attribute)).to_be_visible()


def test_unsubscribe_removes_package(
    live_server: LiveServer,
    as_staff: Page,
    drv: NixDerivation,
    package: Package,
) -> None:
    """Unsubscribing removes the package from the list."""
    as_staff.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)
    as_staff.get_by_placeholder("Package name").fill(drv.attribute)
    as_staff.get_by_role("button", name="Subscribe", exact=True).click()
    unsubscribe = as_staff.get_by_role("button", name="Unsubscribe")
    expect(unsubscribe).to_be_visible()

    unsubscribe.click()
    expect(unsubscribe).to_have_count(0)
    expect(
        as_staff.get_by_text("You haven't subscribed to any packages yet.")
    ).to_be_visible()


def test_unauthenticated_shows_error(
    live_server: LiveServer,
    page: Page,
) -> None:
    """Unauthenticated users see the 'not authenticated' message instead of the form."""
    page.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)
    expect(page.get_by_text("not authenticated", exact=False)).to_be_visible()
    expect(page.get_by_placeholder("Package name")).to_have_count(0)
