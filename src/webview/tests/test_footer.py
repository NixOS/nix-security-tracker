from django.test import Client, override_settings
from django.urls import reverse


def test_footer_revision_in_development(db: None, client: Client) -> None:
    with override_settings(REVISION="abc1234", PRODUCTION=False):
        response = client.get(reverse("webview:home"))
    assert b"abc1234" in response.content
    assert b"(development)" in response.content
    # FIXME(@fricklerhandwerk): Also check for the source URL, but that should come from a setting.


def test_footer_revision_link_in_production(db: None, client: Client) -> None:
    with override_settings(REVISION="abc1234", PRODUCTION=True):
        response = client.get(reverse("webview:home"))
    assert b"/commit/abc1234" in response.content
    assert b"(development)" not in response.content
