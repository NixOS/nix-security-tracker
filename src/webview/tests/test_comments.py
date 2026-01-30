from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal

# TODO(@florentc): Add tests for detail views


def test_dismiss_requires_comment_htmx(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that dismissing a suggestion requires a comment (HTMX case)"""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    dismiss = suggestion.get_by_role("button", name="Dismiss")
    dismiss.click()
    if no_js:
        error = as_staff.locator(
            "#messages",
            has_text="You must provide a dismissal comment",
        )
    else:
        error = suggestion.locator(
            ".error-block",
            has_text="You must provide a dismissal comment",
        )
    expect(error).to_be_visible()


def test_dismiss_with_comment_succeeds(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that dismissing with a comment works and the comment appears in the view context"""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    comment_text = "This suggestion is not relevant because the package is deprecated."
    suggestion.locator("textarea").fill(comment_text)
    dismiss = suggestion.get_by_role("button", name="Dismiss")
    dismiss.click()
    if no_js:
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:dismissed_suggestions")
        )
    else:
        link = as_staff.get_by_role("link", name="View")
        link.click()
    expect(suggestion).to_be_visible()
    comment = suggestion.locator("textarea")
    expect(comment).to_have_value(comment_text)


def test_accept_without_comment_succeeds(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that accepting a suggestion without a comment is allowed"""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    accept = suggestion.get_by_role("button", name="Accept suggestion")
    accept.click()
    if no_js:
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:accepted_suggestions")
        )
    else:
        link = as_staff.get_by_role("link", name="View")
        link.click()
    expect(suggestion).to_be_visible()


def test_accept_with_comment_shows_comment_in_context(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that accepting with a comment shows the comment in the view context"""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    comment_text = "This looks good, creating draft issue."
    suggestion.locator("textarea").fill(comment_text)
    accept = suggestion.get_by_role("button", name="Accept suggestion")
    accept.click()
    if no_js:
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:accepted_suggestions")
        )
    else:
        link = as_staff.get_by_role("link", name="View")
        link.click()
    expect(suggestion).to_be_visible()
    comment = suggestion.locator("textarea")
    expect(comment).to_have_value(comment_text)


def test_updating_comment_on_existing_suggestion(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that updating a comment on an existing suggestion works"""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    initial_comment = "Initial comment"
    suggestion.locator("textarea").fill(initial_comment)
    dismiss = suggestion.get_by_role("button", name="Dismiss")
    dismiss.click()
    if no_js:
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:dismissed_suggestions")
        )
    else:
        link = as_staff.get_by_role("link", name="View")
        link.click()
        # From now on, with javascript on, we are in the detailed view
    updated_comment = "Updated comment with more details"
    suggestion.locator("textarea").fill(updated_comment)
    to_draft = suggestion.get_by_role("button", name="Accept suggestion")
    to_draft.click()
    # With javascript on, we are in the detail view, therefore changing status is reflected directly rather than showing a stub with a "View" link.
    if no_js:
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:accepted_suggestions")
        )
    expect(suggestion).to_be_visible()
    comment = suggestion.locator("textarea")
    expect(comment).to_have_value(updated_comment)


def test_get_requests_ignored(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    drv = cached_suggestion.derivations.first()
    assert drv
    with as_staff.expect_response(lambda response: response.status == 405):
        """
        Check that the HTTP API rejects GET requests.
        """
        as_staff.goto(
            live_server.url
            + reverse(
                "webview:suggestion:update_status",
                kwargs={"suggestion_id": cached_suggestion.pk},
            ),
        )
        as_staff.goto(
            live_server.url
            + reverse(
                "webview:suggestion:ignore_package",
                kwargs={
                    "suggestion_id": cached_suggestion.pk,
                    "package_attr": drv.attribute,
                },
            ),
        )
        as_staff.goto(
            live_server.url
            + reverse(
                "webview:suggestion:add_maintainer",
                kwargs={
                    "suggestion_id": cached_suggestion.pk,
                },
            ),
        )
