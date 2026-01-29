from collections.abc import Callable, Generator
from contextlib import AbstractContextManager
from datetime import timedelta

import freezegun
import pytest
from django.conf import settings
from django.contrib.auth.models import User
from django.urls import reverse
from freezegun.api import FakeDatetime
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixMaintainer


def test_maintainer_addition_creates_activity_log_entry(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    committer: User,
    make_maintainer_from_user: Callable[..., NixMaintainer],
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that adding a maintainer creates an activity log entry"""
    if no_js:
        pytest.xfail("Not implemented")
    maintainer = make_maintainer_from_user(committer)
    as_staff.goto(live_server.url + reverse("webview:suggestions_view"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    maintainers_list = suggestion.locator(f"#maintainers-list-{cached_suggestion.pk}")
    maintainers_list.locator("input").fill(maintainer.github)
    add = maintainers_list.get_by_role("button", name="Add")
    add.click()
    maintainers_list = suggestion.locator(f"#maintainers-list-{cached_suggestion.pk}")
    new_maintainer = maintainers_list.get_by_text(maintainer.github)
    expect(new_maintainer).to_be_visible()
    if not no_js:
        # FIXME(@fricklerhandwerk): Activity log should be updated automatically
        as_staff.reload()
    # Check the action appears in the activity log
    activity_log = suggestion.locator(
        f"#suggestion-activity-log-{cached_suggestion.pk}"
    )
    activity_log.click()
    activity_log.get_by_text(staff.username)
    entry = (
        activity_log.filter(has_text=staff.username)
        .filter(has_text="added maintainer")
        .filter(has_text=maintainer.github)
    )
    expect(entry).to_be_visible()


def test_maintainer_removal_creates_activity_log_entry(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    committer: User,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that removing a maintainer creates an activity log entry"""
    if no_js:
        pytest.xfail("Not implemented")
    as_staff.goto(live_server.url + reverse("webview:suggestions_view"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    maintainers_list = suggestion.locator(f"#maintainers-list-{cached_suggestion.pk}")
    maintainer_name, *_ = cached_suggestion.derivations.all().values_list(
        "metadata__maintainers__github", flat=True
    )
    remove = maintainers_list.get_by_role("button", name="Remove")
    remove.click()
    restore = maintainers_list.get_by_role("button", name="Restore")
    expect(restore).to_be_visible()
    # FIXME(@fricklerhandwerk): Activity log should be updated automatically
    as_staff.reload()

    activity_log = suggestion.locator(
        f"#suggestion-activity-log-{cached_suggestion.pk}"
    )
    activity_log.click()
    entry = (
        activity_log.filter(has_text=staff.username)
        .filter(has_text="removed maintainer")
        .filter(has_text=maintainer_name)
    )
    expect(entry).to_be_visible()


@pytest.fixture()
def frozen_time() -> Generator:
    with freezegun.freeze_time("2026-01-13") as ft:
        yield ft


@pytest.mark.parametrize(
    "within_interval",
    [True, False],
)
def test_maintainer_restoration_activity_log_cancels(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    committer: User,
    cached_suggestion: CVEDerivationClusterProposal,
    frozen_time: FakeDatetime,
    no_js: bool,
    within_interval: bool,
) -> None:
    """Test that restoring a removed maintainer within time window cancels both events"""
    if no_js:
        pytest.xfail("Not implemented")
    as_staff.goto(live_server.url + reverse("webview:suggestions_view"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    maintainers_list = suggestion.locator(f"#maintainers-list-{cached_suggestion.pk}")
    maintainer_name, *_ = cached_suggestion.derivations.all().values_list(
        "metadata__maintainers__github", flat=True
    )

    remove = maintainers_list.get_by_role("button", name="Remove")
    remove.click()
    expect(remove).not_to_be_visible()

    if within_interval:
        seconds = settings.DEBOUNCE_ACTIVITY_LOG_SECONDS / 2
    else:
        seconds = settings.DEBOUNCE_ACTIVITY_LOG_SECONDS * 2

    frozen_time.tick(delta=timedelta(seconds=seconds))
    restore = maintainers_list.get_by_role("button", name="Restore")
    expect(restore).to_be_visible()
    restore.click()
    expect(restore).not_to_be_visible()

    # FIXME(@fricklerhandwerk): Activity log should be updated automatically
    as_staff.reload()

    activity_log = suggestion.locator(
        f"#suggestion-activity-log-{cached_suggestion.pk}"
    )
    if not within_interval:
        expect(activity_log).to_be_visible()
        activity_log.click()
        removed_maintainer = (
            activity_log.filter(has_text=staff.username)
            .filter(has_text="removed maintainer")
            .filter(has_text=maintainer_name)
        )
        added_maintainer = (
            activity_log.filter(has_text=staff.username)
            .filter(has_text="added maintainer")
            .filter(has_text=maintainer_name)
        )
        expect(removed_maintainer).to_be_visible()
        expect(added_maintainer).to_be_visible()
    else:
        expect(activity_log).to_have_count(0)


def test_multiple_maintainer_edits_are_batched_in_activity_log(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    committer: User,
    cached_suggestion: CVEDerivationClusterProposal,
    make_maintainer_from_user: Callable[..., NixMaintainer],
    no_js: bool,
) -> None:
    """Test that multiple maintainer edits by the same user are batched together"""
    if no_js:
        pytest.xfail("Not implemented")
    as_staff.goto(live_server.url + reverse("webview:suggestions_view"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    maintainers_list = suggestion.locator(f"#maintainers-list-{cached_suggestion.pk}")
    maintainer1 = make_maintainer_from_user(staff)
    maintainer2 = make_maintainer_from_user(committer)
    name = maintainers_list.locator("input")
    name.fill(maintainer1.github)
    add = maintainers_list.get_by_role("button", name="Add")
    add.click()
    remove = maintainers_list.get_by_role("button", name="Remove")
    # There's already one maintainer in the `cached_suggestion`'s derivaiton 'by default
    expect(remove).to_have_count(2)
    name.fill(maintainer2.github)
    add.click()
    expect(remove).to_have_count(3)

    # FIXME(@fricklerhandwerk): Activity log should be updated automatically
    as_staff.reload()

    activity_log = suggestion.locator(
        f"#suggestion-activity-log-{cached_suggestion.pk}"
    )
    expect(activity_log).to_be_visible()
    activity_log.click()
    # FIXME(@fricklerhandwerk): We may want to not collapse events that are further apart than some threshold.
    added_maintainers = (
        activity_log.filter(has_text=staff.username)
        .filter(has_text="added")
        .filter(has_text="2 maintainers")
    )
    expect(added_maintainers).to_be_visible()


def test_maintainer_edits_by_different_users_not_batched(
    live_server: LiveServer,
    logged_in_as: Callable[..., AbstractContextManager[Page]],
    make_user: Callable[..., User],
    committer: User,
    cached_suggestion: CVEDerivationClusterProposal,
    make_maintainer_from_user: Callable[..., NixMaintainer],
    no_js: bool,
) -> None:
    """Test that maintainer edits by different users are not batched together"""
    if no_js:
        pytest.xfail("Not implemented")

    user1 = make_user(username="user1", is_staff=True, uid="666")
    user2 = make_user(username="user2", is_staff=True, uid="999")

    maintainer1 = make_maintainer_from_user(user1)
    maintainer2 = make_maintainer_from_user(user2)

    with logged_in_as(user1) as as_user1:
        as_user1.goto(live_server.url + reverse("webview:suggestions_view"))
        suggestion = as_user1.locator(f"#suggestion-{cached_suggestion.pk}")
        maintainers_list = suggestion.locator(
            f"#maintainers-list-{cached_suggestion.pk}"
        )
        name = maintainers_list.locator("input")
        name.fill(maintainer1.github)
        add = maintainers_list.get_by_role("button", name="Add")
        add.click()

    with logged_in_as(user2) as as_user2:
        as_user2.goto(live_server.url + reverse("webview:suggestions_view"))
        suggestion = as_user2.locator(f"#suggestion-{cached_suggestion.pk}")
        maintainers_list = suggestion.locator(
            f"#maintainers-list-{cached_suggestion.pk}"
        )
        name = maintainers_list.locator("input")
        name.fill(maintainer2.github)
        add = maintainers_list.get_by_role("button", name="Add")
        add.click()
        remove = maintainers_list.get_by_role("button", name="Remove")
        # There's already one maintainer in the `cached_suggestion`'s derivaiton 'by default
        expect(remove).to_have_count(3)

        as_user2.reload()

        activity_log = suggestion.locator(
            f"#suggestion-activity-log-{cached_suggestion.pk}"
        )
        expect(activity_log).to_be_visible()
        activity_log.click()
        added_maintainer1 = (
            activity_log.filter(has_text=user1.username)
            .filter(has_text="added maintainer")
            .filter(has_text=maintainer1.github)
        )
        expect(added_maintainer1).to_be_visible()
        added_maintainer2 = (
            activity_log.filter(has_text=user2.username)
            .filter(has_text="added maintainer")
            .filter(has_text=maintainer2.github)
        )
        expect(added_maintainer2).to_be_visible()
