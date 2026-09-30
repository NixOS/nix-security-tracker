from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from .routes import HOME


def test_rate_limit_shows_toast(live_server: LiveServer, page: Page) -> None:
    """A 429 response from any API request shows a rate-limit error."""
    page.route(
        "**/api/v1/me",
        lambda route: route.fulfill(
            status=429,
            content_type="application/json",
            body='{"detail": "Foo"}',
        ),
    )

    # Home calls the "me" endpoint for authentication status
    page.goto(live_server.url + HOME)

    expect(page.get_by_text("Too many requests")).to_be_visible()
