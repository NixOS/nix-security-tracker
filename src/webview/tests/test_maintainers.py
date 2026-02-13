import re
from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer
from pytest_mock import MockerFixture

from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation, NixMaintainer


def test_add_maintainer_widget_present_when_logged_in(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Test that logged in user can see the add user form"""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    add_user_text_field = suggestion.get_by_placeholder("GitHub username")
    add_user_submit_button = suggestion.get_by_role("button", name="Add")
    expect(add_user_text_field).to_be_visible()
    expect(add_user_submit_button).to_be_visible()


def test_add_maintainer_widget_absent_when_logged_out(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Test that the add user form isn't present when logged out"""
    page.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = page.locator(f"#suggestion-{cached_suggestion.pk}")
    add_user_text_field = suggestion.get_by_placeholder("GitHub username")
    add_user_submit_button = suggestion.get_by_role("button", name="Add")
    expect(add_user_text_field).not_to_be_visible()
    expect(add_user_submit_button).not_to_be_visible()


def test_add_existing_maintainer_returns_error(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that adding a maintainer who is already attached to a suggestion returns the right error"""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    add_user_text_field = suggestion.get_by_placeholder("GitHub username")
    add_user_submit_button = suggestion.get_by_role("button", name="Add")
    add_user_text_field.fill("maintainer")
    add_user_submit_button.click()
    if no_js:
        error = as_staff.locator(".error-block", has_text="Already a maintainer")
    else:
        error = suggestion.locator(".error-inline", has_text="Already a maintainer")
    expect(error).to_be_visible()


def test_add_new_maintainer_already_in_db_succeeds(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    make_maintainer: Callable[..., NixMaintainer],
    no_js: bool,
) -> None:
    """Test that adding a new maintainer who is already present in our database succeeds"""
    make_maintainer(
        github_id=555,
        github="alice",
        name="Alice DeBob",
        email="alice@somewhere.com",
    )
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    add_user_text_field = suggestion.get_by_placeholder("GitHub username")
    add_user_submit_button = suggestion.get_by_role("button", name="Add")
    add_user_text_field.fill("alice")
    add_user_submit_button.click()
    new_maintainer_item = suggestion.get_by_text("Alice DeBob")
    expect(new_maintainer_item).to_be_visible()


def test_add_new_maintainer_from_github_succeeds(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    mocker: MockerFixture,
) -> None:
    """Test that adding a new maintainer who exists on GitHub but not in our database succeeds"""
    mock_fetch = mocker.patch("webview.suggestions.views.maintainers.fetch_user_info")
    mock_fetch.return_value = {
        "id": 555,
        "login": "alice",
        "name": "Alice DeBob",
        "email": "alice@somewhere.com",
    }
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    add_user_text_field = suggestion.get_by_placeholder("GitHub username")
    add_user_submit_button = suggestion.get_by_role("button", name="Add")
    add_user_text_field.fill("alice")
    add_user_submit_button.click()
    new_maintainer_item = suggestion.get_by_text("Alice DeBob")
    expect(new_maintainer_item).to_be_visible()


def test_add_maintainer_from_invalid_github_handle_returns_error(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
    mocker: MockerFixture,
) -> None:
    """Test that adding a new maintainer who doesn't exist on GitHub returns the right error"""
    mock_fetch = mocker.patch("webview.suggestions.views.maintainers.fetch_user_info")
    mock_fetch.return_value = None
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    add_user_text_field = suggestion.get_by_placeholder("GitHub username")
    add_user_submit_button = suggestion.get_by_role("button", name="Add")
    add_user_text_field.fill("alice")
    add_user_submit_button.click()
    if no_js:
        error = as_staff.locator(
            ".error-block", has_text="Could not fetch maintainer from GitHub"
        )
    else:
        error = suggestion.locator(
            ".error-inline", has_text="Could not fetch maintainer from GitHub"
        )
    expect(error).to_be_visible()


@pytest.mark.parametrize(
    "ignore_maintainer",
    [True, False],
)
def test_ignore_restore_package(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_maintainer_from_user: Callable[..., NixMaintainer],
    staff: User,
    committer: User,
    ignore_maintainer: bool,
) -> None:
    """Test ignoring and restoring a package"""
    maintainer1 = make_maintainer_from_user(staff)
    maintainer2 = make_maintainer_from_user(committer)
    drv1 = make_drv(pname="package1", maintainer=maintainer1)
    drv2 = make_drv(pname="package2", maintainer=maintainer2)
    suggestion = make_cached_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))

    maintainers_section = as_staff.locator(f"#maintainers-list-{suggestion.pk}")
    maintainers_list = maintainers_section.get_by_role("listitem")
    expect(maintainers_list).to_have_count(2)

    maintainer1_item = maintainers_section.get_by_role("listitem").filter(
        has_text=maintainer1.github,
    )

    if ignore_maintainer:
        ignore_maintainer1 = maintainer1_item.get_by_role("button", name="Ignore")
        ignore_maintainer1.click()
        expect(maintainers_list).to_have_count(1)

    active_packages = as_staff.locator(f"#suggestion-{suggestion.pk}-active-packages")
    ignore_package1_button = active_packages.locator(".package-package1").get_by_role(
        "button", name="Ignore"
    )
    ignore_package1_button.click()
    ignored_packages_section = as_staff.locator(f"#suggestion-{suggestion.pk}")
    ignore_package = ignored_packages_section.get_by_text(
        re.compile("Ignored packages"),
    )
    ignore_package.click()

    expect(maintainers_list).to_have_count(1)

    ignored_maintainers_section = as_staff.locator(
        f"#maintainers-list-{suggestion.pk}-ignored"
    )
    expect(ignored_maintainers_section).not_to_be_visible()

    restore_package1_button = ignored_packages_section.locator(
        ".package-package1"
    ).get_by_role("button", name="Restore")
    restore_package1_button.click()

    if ignore_maintainer:
        expect(maintainers_list).to_have_count(1)
        ignored_maintainers_section.click()
        ignored_maintainers_list = ignored_maintainers_section.get_by_role("listitem")
        expect(ignored_maintainers_list).to_have_count(1)
    else:
        expect(maintainers_list).to_have_count(2)
        expect(ignored_maintainers_section).not_to_be_visible()
