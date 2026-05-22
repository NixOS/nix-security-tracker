from collections.abc import Callable
from datetime import timedelta

from django.test import Client
from django.urls import reverse
from django.utils import timezone
from freezegun import freeze_time

from shared.models.linkage import (
    CVEDerivationClusterProposal,
    PackageOverlay,
)
from shared.models.nix_evaluation import NixDerivation


def test_feed_unknown_package_fails(client: Client, db: None) -> None:
    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": "nonexistent"})
    )
    assert response.status_code == 404


def test_feed_known_package_succeeds(
    client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:

    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
    )
    assert response.status_code == 200
    assert "application/atom+xml" in response["Content-Type"]


def test_feed_contains_creation_event(
    client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
    )
    assert response.status_code == 200
    content = response.content.decode()
    assert "created" in content
    assert cached_suggestion.cve.cve_id in content


def test_feed_contains_status_change_event(
    client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    # Change status to accepted to produce a status-change event
    cached_suggestion.change_status(CVEDerivationClusterProposal.Status.ACCEPTED)

    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
    )
    content = response.content.decode()
    assert "accepted" in content


def test_feed_item_links_to_suggestion_detail(
    client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
    )
    content = response.content.decode()
    suggestion_url = reverse(
        "webview:suggestion:detail", kwargs={"suggestion_id": cached_suggestion.pk}
    )
    assert suggestion_url in content


def test_feed_contains_cve_link(
    client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
    )
    content = response.content.decode()
    assert cached_suggestion.cve.cve_id in content


def test_feed_excludes_suggestion_with_ignored_package(
    client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    # Ignore the package in the suggestion
    PackageOverlay.objects.create(
        suggestion=cached_suggestion,
        package_attribute=drv.attribute,
        overlay_type=PackageOverlay.Type.IGNORED,
    )

    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
    )
    assert response.status_code == 200
    content = response.content.decode()
    # No entries should appear for this suggestion
    suggestion_url = reverse(
        "webview:suggestion:detail", kwargs={"suggestion_id": cached_suggestion.pk}
    )
    assert suggestion_url not in content


def test_feed_auto_dismiss_not_in_feed(
    client: Client,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
) -> None:
    suggestion = make_cached_suggestion(
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.EXCLUSIVELY_HOSTED_SERVICE
    )
    suggestion_url = reverse(
        "webview:suggestion:detail", kwargs={"suggestion_id": suggestion.pk}
    )
    response = client.get(
        reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
    )
    content = response.content.decode()
    assert suggestion_url not in content


def test_feed_excludes_events_older_than_30_days(
    client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    # The event is recorded now; simulate requesting the feed 31 days later
    # so the cutoff (frozen_now - 30 days) falls after the event timestamp.
    with freeze_time(timezone.now() + timedelta(days=31)):
        response = client.get(
            reverse("feeds:package_feed", kwargs={"package_name": drv.attribute})
        )
    assert response.status_code == 200
    content = response.content.decode()
    suggestion_url = reverse(
        "webview:suggestion:detail", kwargs={"suggestion_id": cached_suggestion.pk}
    )
    assert suggestion_url not in content
