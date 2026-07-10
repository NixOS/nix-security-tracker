from collections.abc import Callable

import pytest
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal


@pytest.fixture
def url() -> Callable[[int], str]:
    return lambda pk: reverse("cvederivationclusterproposal-detail", args=[pk])


def test_suggestion_retrieve_anonymous(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    url: Callable[[int], str],
) -> None:
    """Anonymous users can retrieve suggestion details."""
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200


def test_suggestion_retrieve_not_found(db: None, url: Callable[[int], str]) -> None:
    client = APIClient()
    response = client.get(url(999999999))
    assert response.status_code == 404
    assert "detail" in response.data


def test_suggestion_retrieve_contains_top_level_fields(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    url: Callable[[int], str],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200
    data = response.data
    assert data["id"] == suggestion.pk
    assert data["status"] == CVEDerivationClusterProposal.Status.PENDING
    assert data["cve_id"] == suggestion.cve.cve_id


def test_suggestion_retrieve_rejected_includes_rejection_reason(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    url: Callable[[int], str],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
    )
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200
    assert (
        response.data["rejection_reason"]
        == CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS
    )


def test_suggestion_retrieve_no_rejection_reason_when_not_rejected(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    url: Callable[[int], str],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200
    assert "rejection_reason" not in response.data


def test_suggestion_retrieve_includes_comment_when_set(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    url: Callable[[int], str],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    suggestion.comment = "triager note"
    suggestion.save(update_fields=["comment"])
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200
    assert response.data["comment"] == "triager note"


def test_suggestion_retrieve_comment_absent_when_not_set(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    url: Callable[[int], str],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200
    assert "comment" not in response.data
