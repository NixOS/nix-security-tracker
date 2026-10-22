from collections.abc import Callable

import pytest
from django.core.cache import cache
from django.test import override_settings
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from api.suggestions.views import SuggestionViewSet
from api.throttling import BulkRateThrottle
from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation, NixMaintainer

REFERENCE_URL = "https://example.com/advisory"
REFERENCE_NAME = "Advisory"


STATUS_URL = reverse("cvederivationclusterproposal-bulk-status")
BUNDLE_URL = reverse("cvederivationclusterproposal-bulk-bundle")
COMMENT_URL = reverse("cvederivationclusterproposal-bulk-comment")
PACKAGES_URL = reverse("cvederivationclusterproposal-bulk-packages")
MAINTAINERS_URL = reverse("cvederivationclusterproposal-bulk-maintainers")
REFERENCES_URL = reverse("cvederivationclusterproposal-bulk-references")


PENDING_SUGGESTIONS = 3


@pytest.fixture
def pending_suggestions(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> list[CVEDerivationClusterProposal]:
    return [make_cached_suggestion() for _ in range(PENDING_SUGGESTIONS)]


def test_bulk_status_unauthenticated(
    pending_suggestions: list[CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    response = anonymous_client.post(
        f"{STATUS_URL}?status=pending",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 401


def test_bulk_status_non_committer(
    pending_suggestions: list[CVEDerivationClusterProposal],
    client: APIClient,
) -> None:
    response = client.post(
        f"{STATUS_URL}?status=pending",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 403


def test_bulk_without_filter_is_refused(
    pending_suggestions: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    response = staff_client.post(
        STATUS_URL,
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 400
    assert "requires at least one filter" in response.text
    assert all(
        suggestion.status == CVEDerivationClusterProposal.Status.PENDING
        for suggestion in CVEDerivationClusterProposal.objects.all()
    )


@override_settings(API_BULK_MAX_AFFECTED=PENDING_SUGGESTIONS - 1)
def test_bulk_selection_larger_than_the_cap_is_refused(
    pending_suggestions: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    response = staff_client.post(
        f"{STATUS_URL}?status=pending",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 400
    assert f"more than the {PENDING_SUGGESTIONS - 1}" in response.text
    assert all(
        suggestion.status == CVEDerivationClusterProposal.Status.PENDING
        for suggestion in CVEDerivationClusterProposal.objects.all()
    )


def test_bulk_status_accepts_the_whole_selection(
    pending_suggestions: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    response = staff_client.post(
        f"{STATUS_URL}?status=pending",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(pending_suggestions)}
    assert all(
        suggestion.status == CVEDerivationClusterProposal.Status.ACCEPTED
        for suggestion in CVEDerivationClusterProposal.objects.all()
    )


def test_bulk_status_on_an_empty_selection_affects_nothing(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    make_cached_suggestion(status=CVEDerivationClusterProposal.Status.ACCEPTED)
    response = staff_client.post(
        f"{STATUS_URL}?status=pending",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": 0}


def test_bulk_status_rejects_with_a_reason(
    pending_suggestions: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    response = staff_client.post(
        f"{STATUS_URL}?status=pending",
        {
            "status": CVEDerivationClusterProposal.Status.REJECTED,
            "rejection_reason": CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
        },
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(pending_suggestions)}
    assert all(
        suggestion.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS
        for suggestion in CVEDerivationClusterProposal.objects.all()
    )


def test_bulk_status_only_applies_to_the_selection(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    selected = make_cached_suggestion()
    untouched = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
    )
    response = staff_client.post(
        f"{STATUS_URL}?status=pending",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": 1}
    selected.refresh_from_db()
    untouched.refresh_from_db()
    assert selected.status == CVEDerivationClusterProposal.Status.ACCEPTED
    assert untouched.status == CVEDerivationClusterProposal.Status.REJECTED


def test_bulk_status_refused_by_one_suggestion_modifies_nothing(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    """Bulk operations are all-or-nothing, and report every suggestion that refused."""
    pending = make_cached_suggestion()
    accepted = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    response = staff_client.post(
        f"{STATUS_URL}?status=pending&status=accepted",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 400
    assert list(response.data["reasons"]) == [str(accepted.pk)]
    assert "Already in status" in str(response.data["reasons"][str(accepted.pk)])
    pending.refresh_from_db()
    assert pending.status == CVEDerivationClusterProposal.Status.PENDING


def test_bulk_status_reports_every_offending_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    published = [
        make_cached_suggestion(status=CVEDerivationClusterProposal.Status.PUBLISHED)
        for _ in range(2)
    ]
    response = staff_client.post(
        f"{STATUS_URL}?status=published",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == 400
    assert set(response.data["reasons"]) == {str(s.pk) for s in published}


def test_bulk_status_away_from_accepted_empties_the_issue_draft(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    response = staff_client.post(
        f"{STATUS_URL}?in_issue_draft=true",
        {
            "status": CVEDerivationClusterProposal.Status.REJECTED,
            "rejection_reason": CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
        },
        format="json",
    )
    assert response.status_code == 200
    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.REJECTED
    assert not suggestion.in_issue_draft


def test_bulk_status_records_one_activity_log_entry_per_suggestion(
    pending_suggestions: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    staff_client.post(
        f"{STATUS_URL}?status=pending",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    for suggestion in pending_suggestions:
        response = staff_client.get(
            reverse(
                "cvederivationclusterproposal-activity-log",
                kwargs={"pk": suggestion.pk},
            )
        )
        assert response.status_code == 200
        assert any(
            entry["status_value"] == CVEDerivationClusterProposal.Status.ACCEPTED
            for entry in response.data
        )


def test_bulk_bundle_adds_accepted_suggestions_to_the_issue_draft(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    suggestions = [
        make_cached_suggestion(status=CVEDerivationClusterProposal.Status.ACCEPTED)
        for _ in range(2)
    ]
    response = staff_client.patch(
        f"{BUNDLE_URL}?status=accepted",
        {"in_issue_draft": True},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(suggestions)}
    for suggestion in suggestions:
        suggestion.refresh_from_db()
        assert suggestion.in_issue_draft


def test_bulk_bundle_refuses_suggestions_that_are_not_accepted(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    accepted = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    pending = make_cached_suggestion()
    response = staff_client.patch(
        f"{BUNDLE_URL}?status=accepted&status=pending",
        {"in_issue_draft": True},
        format="json",
    )
    assert response.status_code == 400
    assert list(response.data["reasons"]) == [str(pending.pk)]
    accepted.refresh_from_db()
    assert not accepted.in_issue_draft


def test_bulk_comment_replaces_the_comment_shared_by_the_selection(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    selected = [make_cached_suggestion(comment="Waiting upstream") for _ in range(2)]
    untouched = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, comment="Something else"
    )
    response = staff_client.patch(
        f"{COMMENT_URL}?status=pending",
        {"comment": "New comment"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(selected)}
    for suggestion in selected:
        suggestion.refresh_from_db()
        assert suggestion.comment == "New comment"
    untouched.refresh_from_db()
    assert untouched.comment == "Something else"


def test_bulk_comment_treats_an_empty_comment_as_no_comment(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    suggestions = [make_cached_suggestion(comment=comment) for comment in ("", None)]
    response = staff_client.patch(
        f"{COMMENT_URL}?status=pending",
        {"comment": "New comment"},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(suggestions)}
    for suggestion in suggestions:
        suggestion.refresh_from_db()
        assert suggestion.comment == "New comment"


def test_bulk_comment_clears_the_comment(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    suggestion = make_cached_suggestion(comment="Waiting upstream")
    response = staff_client.patch(
        f"{COMMENT_URL}?status=pending", {"comment": ""}, format="json"
    )
    assert response.status_code == 200
    suggestion.refresh_from_db()
    assert suggestion.comment is None


def test_bulk_comment_refuses_a_selection_saying_different_things(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    suggestions = [
        make_cached_suggestion(comment=comment)
        for comment in ("Waiting upstream", "Something else")
    ]
    response = staff_client.patch(
        f"{COMMENT_URL}?status=pending",
        {"comment": "New comment"},
        format="json",
    )
    assert response.status_code == 400
    assert "do not all hold the same comment" in response.data["detail"]
    for suggestion in suggestions:
        comment = suggestion.comment
        suggestion.refresh_from_db()
        assert suggestion.comment == comment


def test_bulk_packages_ignores_a_package_everywhere(
    pending_suggestions: list[CVEDerivationClusterProposal],
    drv: NixDerivation,
    staff_client: APIClient,
) -> None:
    response = staff_client.patch(
        f"{PACKAGES_URL}?package={drv.attribute}",
        {"package_attribute": drv.attribute, "ignored": True},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(pending_suggestions)}
    for suggestion in pending_suggestions:
        suggestion.refresh_from_db()
        assert drv.attribute not in suggestion.cached.payload["packages"]


def test_bulk_packages_restores_a_package_everywhere(
    pending_suggestions: list[CVEDerivationClusterProposal],
    drv: NixDerivation,
    staff_client: APIClient,
) -> None:
    for suggestion in pending_suggestions:
        suggestion.ignore_package(drv.attribute)
    response = staff_client.patch(
        f"{PACKAGES_URL}?status=pending",
        {"package_attribute": drv.attribute, "ignored": False},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(pending_suggestions)}
    for suggestion in pending_suggestions:
        suggestion.refresh_from_db()
        assert drv.attribute in suggestion.cached.payload["packages"]


def test_bulk_packages_refuses_a_selection_missing_the_package(
    pending_suggestions: list[CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
    staff_client: APIClient,
) -> None:
    other = make_cached_suggestion(
        drvs={make_drv(pname="other"): ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    response = staff_client.patch(
        f"{PACKAGES_URL}?status=pending",
        {"package_attribute": drv.attribute, "ignored": True},
        format="json",
    )
    assert response.status_code == 400
    assert list(response.data["reasons"]) == [str(other.pk)]
    for suggestion in pending_suggestions:
        suggestion.refresh_from_db()
        assert drv.attribute in suggestion.cached.payload["packages"]


def test_bulk_maintainers_ignores_a_maintainer_everywhere(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
    staff_client: APIClient,
) -> None:
    suggestions = [make_cached_suggestion() for _ in range(2)]
    response = staff_client.patch(
        f"{MAINTAINERS_URL}?status=pending",
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(suggestions)}
    for suggestion in suggestions:
        suggestion.refresh_from_db()
        ignored = suggestion.cached.payload["categorized_maintainers"]["ignored"]
        assert any(m["github_id"] == maintainer.github_id for m in ignored)


def test_bulk_maintainers_refuses_an_already_ignored_maintainer(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
    staff_client: APIClient,
) -> None:
    already = make_cached_suggestion()
    already.ignore_maintainer(maintainer.github_id)
    untouched = make_cached_suggestion()
    response = staff_client.patch(
        f"{MAINTAINERS_URL}?status=pending",
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    assert response.status_code == 400
    assert list(response.data["reasons"]) == [str(already.pk)]
    untouched.refresh_from_db()
    assert untouched.cached.payload["categorized_maintainers"]["ignored"] == []


@pytest.fixture
def suggestions_with_reference(
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> list[CVEDerivationClusterProposal]:
    container = make_container(references=[(REFERENCE_NAME, REFERENCE_URL, [])])
    return [make_cached_suggestion(container=container) for _ in range(2)]


def test_bulk_references_ignores_a_reference_everywhere(
    suggestions_with_reference: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    response = staff_client.patch(
        f"{REFERENCES_URL}?status=pending",
        {"reference_url": REFERENCE_URL, "ignored": True},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(suggestions_with_reference)}
    for suggestion in suggestions_with_reference:
        suggestion.refresh_from_db()
        active = suggestion.cached.payload["categorized_url_references"]["active"]
        assert all(reference["url"] != REFERENCE_URL for reference in active)


def test_bulk_references_restores_a_reference_everywhere(
    suggestions_with_reference: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    for suggestion in suggestions_with_reference:
        suggestion.ignore_reference(REFERENCE_URL)
    response = staff_client.patch(
        f"{REFERENCES_URL}?status=pending",
        {"reference_url": REFERENCE_URL, "ignored": False},
        format="json",
    )
    assert response.status_code == 200
    for suggestion in suggestions_with_reference:
        suggestion.refresh_from_db()
        active = suggestion.cached.payload["categorized_url_references"]["active"]
        assert any(reference["url"] == REFERENCE_URL for reference in active)


@override_settings(API_BULK_THROTTLE_SECURITY_TEAM="1/min")
def test_bulk_operations_have_their_own_rate_limit(
    pending_suggestions: list[CVEDerivationClusterProposal],
    staff_client: APIClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    cache.clear()
    monkeypatch.setattr(SuggestionViewSet, "bulk_throttle_classes", [BulkRateThrottle])
    body = {"status": CVEDerivationClusterProposal.Status.ACCEPTED}
    assert (
        staff_client.post(
            f"{STATUS_URL}?status=pending", body, format="json"
        ).status_code
        == 200
    )
    assert (
        staff_client.post(
            f"{STATUS_URL}?status=accepted", body, format="json"
        ).status_code
        == 429
    )
