from collections.abc import Callable

from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.cve import Container
from shared.models.issue import NixpkgsIssue


def test_list_issues_by_cve(
    make_container: Callable[..., Container],
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    container1 = make_container(cve_id="CVE-2025-1111")
    container2 = make_container(cve_id="CVE-2025-2222")
    issue1 = make_issue(container=container1)
    make_issue(container=container2)

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


def test_issue_detail_by_code(
    make_container: Callable[..., Container],
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    container = make_container(cve_id="CVE-2025-1111")
    issue = make_issue(container=container)
    client = APIClient()

    detail_url = reverse("nixpkgsissue-by-code", kwargs={"code": issue.code})
    response = client.get(detail_url)
    assert response.status_code == 200
    assert response.data["code"] == issue.code
    assert response.data["cve"] == container.cve.cve_id

    missing_url = reverse("nixpkgsissue-by-code", kwargs={"code": "NIXPKGS-2099-99999"})
    assert client.get(missing_url).status_code == 404
