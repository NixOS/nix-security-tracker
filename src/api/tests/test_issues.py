from collections.abc import Callable

from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.cve import Container
from shared.models.issue import (
    NixpkgsIssue,
)
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)


def test_published_issue(
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    container1 = make_container(cve_id="CVE-2025-1111")
    container2 = make_container(cve_id="CVE-2025-2222")
    suggestion1 = make_cached_suggestion(
        container=container1,
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    suggestion2 = make_cached_suggestion(
        container=container2,
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )

    issue1 = NixpkgsIssue.create_nixpkgs_issue(suggestion1)
    _ = NixpkgsIssue.create_nixpkgs_issue(suggestion2)
    client = APIClient()
    url = reverse("nixpkgsissue-list")

    # All CVEs
    response = client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 2

    # A specific CVE
    response = client.get(url, {"cve": container1.cve.cve_id})
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["code"] == issue1.code
    assert response.data[0]["cve"] == container1.cve.cve_id

    # Multiple CVEs
    response = client.get(
        url, {"cve": f"{container1.cve.cve_id},{container2.cve.cve_id}"}
    )
    assert response.status_code == 200
    assert len(response.data) == 2

    # Non-existent CVE
    response = client.get(url, {"cve": "CVE-9999-0000"})
    assert response.status_code == 200
    assert len(response.data) == 0
