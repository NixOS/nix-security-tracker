from collections.abc import Callable
from datetime import timedelta

from django.utils import timezone
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation


def url() -> str:
    return reverse("cvederivationclusterproposal-list")


def detail_url(pk: int) -> str:
    return reverse("cvederivationclusterproposal-detail", kwargs={"pk": pk})


def test_suggestion_list_anonymous(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Anonymous users can list suggestions."""
    client = APIClient()
    make_cached_suggestion()
    response = client.get(url())
    assert response.status_code == 200


def test_suggestion_list_paginated_shape(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """The response is paginated with count/next/previous/results."""
    client = APIClient()
    make_cached_suggestion()
    response = client.get(url())
    assert response.status_code == 200
    assert set(response.data.keys()) == {"count", "next", "previous", "results"}
    assert response.data["count"] == 1
    assert len(response.data["results"]) == 1
    assert (
        response.data["results"][0]["id"]
        == CVEDerivationClusterProposal.objects.get().pk
    )


def test_suggestion_list_orders_by_most_recently_modified_first(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Suggestions are sorted by most recently updated (then created) first."""
    client = APIClient()
    older = make_cached_suggestion()
    newer = make_cached_suggestion()

    now = timezone.now()
    CVEDerivationClusterProposal.objects.filter(pk=older.pk).update(
        created_at=now - timedelta(days=2), updated_at=now - timedelta(days=2)
    )
    CVEDerivationClusterProposal.objects.filter(pk=newer.pk).update(
        created_at=now - timedelta(days=1), updated_at=now - timedelta(days=1)
    )

    response = client.get(url())
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert ids == [newer.pk, older.pk]


def test_suggestion_list_reflects_updated_at_over_created_at(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A suggestion created earlier but modified more recently sorts first."""
    client = APIClient()
    created_first = make_cached_suggestion()
    created_second = make_cached_suggestion()

    now = timezone.now()
    # `created_first` was created before `created_second`, but was modified after it.
    CVEDerivationClusterProposal.objects.filter(pk=created_first.pk).update(
        created_at=now - timedelta(days=2), updated_at=now
    )
    CVEDerivationClusterProposal.objects.filter(pk=created_second.pk).update(
        created_at=now - timedelta(days=1), updated_at=now - timedelta(days=1)
    )

    response = client.get(url())
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert ids == [created_first.pk, created_second.pk]


def test_suggestion_list_excludes_suggestions_without_fresh_cache(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Suggestions without a fresh (or any) cache are not listed."""
    client = APIClient()
    uncached = make_suggestion()

    response = client.get(url())
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert uncached.pk not in ids


def test_suggestion_list_excludes_outdated_algorithm_version_pending_suggestions(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Pending suggestions from an outdated matching algorithm version are excluded."""
    client = APIClient()
    outdated = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION - 1,  # type: ignore[operator]
    )
    current = make_cached_suggestion(status=CVEDerivationClusterProposal.Status.PENDING)

    response = client.get(url())
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert outdated.pk not in ids
    assert current.pk in ids


def test_suggestion_list_second_page(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Requesting a second page returns the next batch of results."""
    client = APIClient()
    for _ in range(15):
        make_cached_suggestion()

    first_page = client.get(url())
    assert first_page.status_code == 200
    assert first_page.data["count"] == 15
    assert len(first_page.data["results"]) == 10
    assert first_page.data["next"] is not None

    second_page = client.get(url(), {"page": 2})
    assert second_page.status_code == 200
    assert len(second_page.data["results"]) == 5
    assert second_page.data["next"] is None

    first_page_ids = {item["id"] for item in first_page.data["results"]}
    second_page_ids = {item["id"] for item in second_page.data["results"]}
    assert first_page_ids.isdisjoint(second_page_ids)


def test_suggestion_list_filters_by_single_status(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Filtering by a single status only returns suggestions in that status."""
    client = APIClient()
    pending = make_cached_suggestion(status=CVEDerivationClusterProposal.Status.PENDING)
    accepted = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )

    response = client.get(url(), {"status": "accepted"})
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert ids == [accepted.pk]
    assert pending.pk not in ids


def test_suggestion_list_filters_by_multiple_statuses(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Filtering by several statuses combines them with OR."""
    client = APIClient()
    pending = make_cached_suggestion(status=CVEDerivationClusterProposal.Status.PENDING)
    accepted = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    rejected = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.REJECTED
    )

    response = client.get(url(), [("status", "pending"), ("status", "accepted")])
    assert response.status_code == 200
    ids = {item["id"] for item in response.data["results"]}
    assert ids == {pending.pk, accepted.pk}
    assert rejected.pk not in ids


def test_suggestion_list_invalid_status_returns_400(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """An unknown status value is rejected."""
    client = APIClient()
    make_cached_suggestion()

    response = client.get(url(), {"status": "not-a-real-status"})
    assert response.status_code == 400


def test_suggestion_list_filters_by_in_issue_draft(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Filtering by in_issue_draft only returns matching suggestions."""
    client = APIClient()
    in_draft = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    not_in_draft = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=False
    )

    response = client.get(url(), {"in_issue_draft": "true"})
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert ids == [in_draft.pk]

    response = client.get(url(), {"in_issue_draft": "false"})
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert ids == [not_in_draft.pk]


def test_suggestion_list_filters_by_package(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
) -> None:
    """Filtering by package only returns suggestions with that active package."""
    client = APIClient()
    package1 = make_drv(pname="foo")
    package2 = make_drv(pname="bar")
    container1 = make_container(cve_id="CVE-2026-1001")
    container2 = make_container(cve_id="CVE-2026-1002")
    matching = make_cached_suggestion(
        container=container1, drvs={package1: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    other = make_cached_suggestion(
        container=container2, drvs={package2: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )

    response = client.get(url(), {"package": package1.attribute})
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert ids == [matching.pk]
    assert other.pk not in ids


def test_suggestion_list_filters_excludes_ignored_package(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """A suggestion whose only matching package has been ignored isn't returned."""
    client = APIClient()
    package = make_drv(pname="foo")
    suggestion = make_cached_suggestion(
        drvs={package: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    suggestion.ignore_package(package.attribute)

    response = client.get(url(), {"package": package.attribute})
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert suggestion.pk not in ids


def test_suggestion_list_combines_filters_with_and(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
) -> None:
    """Status, in_issue_draft, and package filters combine with AND."""
    client = APIClient()
    package = make_drv(pname="foo")
    container1 = make_container(cve_id="CVE-2026-2001")
    container2 = make_container(cve_id="CVE-2026-2002")

    matching = make_cached_suggestion(
        container=container1,
        drvs={package: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    # Same package and draft state, but wrong status.
    wrong_status = make_cached_suggestion(
        container=container2,
        drvs={package: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.PENDING,
    )

    response = client.get(
        url(),
        {"status": "accepted", "in_issue_draft": "true", "package": package.attribute},
    )
    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert ids == [matching.pk]
    assert wrong_status.pk not in ids


def test_suggestion_detail_unaffected_by_list_filters(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Query params meant for the list endpoint don't filter out detail lookups."""
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )

    # A status filter that this suggestion doesn't match must not 404 the detail view.
    response = client.get(detail_url(suggestion.pk), {"status": "accepted"})
    assert response.status_code == 200
    assert response.data["id"] == suggestion.pk
