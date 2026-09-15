from collections.abc import Callable

from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal


def url(cve_id: str) -> str:
    return reverse("cvederivationclusterproposal-by-cve", args=[cve_id])


def test_suggestion_retrieve_by_cve_anonymous(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    response = client.get(url(suggestion.cve.cve_id))
    assert response.status_code == 200


def test_suggestion_retrieve_by_cve_contains_top_level_fields(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    response = client.get(url(suggestion.cve.cve_id))
    assert response.status_code == 200
    data = response.data
    assert data["id"] == suggestion.pk
    assert data["status"] == CVEDerivationClusterProposal.Status.PENDING
    assert data["cve_id"] == suggestion.cve.cve_id


def test_suggestion_retrieve_by_cve_not_found(
    db: None, url: Callable[[str], str]
) -> None:
    client = APIClient()
    response = client.get(url("CVE-2099-9999"))
    assert response.status_code == 404
    assert "detail" in response.data
