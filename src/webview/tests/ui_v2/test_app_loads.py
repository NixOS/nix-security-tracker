from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from .routes import HOME


def test_ui_v2_loads(live_server: LiveServer, page: Page) -> None:
    """The new UI boots end to end.

    Ensures Django serves the HTML shell, loads the built JS/CSS from, and Preact mounts and renders the header.
    """
    page.goto(live_server.url + HOME)

    # The header Title is a link; the Home page heading with the same text is a plain
    # heading, so the link role disambiguates and asserts the SPA actually rendered.
    title = page.get_by_role("link", name="Nixpkgs security tracker")
    expect(title).to_be_visible()
