from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.matching_training_data import SCHEMA_VERSION
from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    PackageOverlay,
)

url = reverse("matching-training-data")


@pytest.fixture
def client(
    make_client: Callable[..., APIClient], matching_training_user: User
) -> APIClient:
    return make_client(matching_training_user)


@pytest.fixture
def curated_proposals(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> dict[str, CVEDerivationClusterProposal]:
    pending = make_suggestion(
        container=make_container(cve_id="CVE-2026-pend"),
        status=CVEDerivationClusterProposal.Status.PENDING,
    )
    accepted = make_suggestion(
        container=make_container(cve_id="CVE-2026-acc"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=1,
    )
    rejected = make_suggestion(
        container=make_container(cve_id="CVE-2026-rej"),
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
        algorithm_version=1,
    )
    auto_reject = make_suggestion(
        container=make_container(cve_id="CVE-2026-auto"),
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NO_MATCHES,
        algorithm_version=1,
        drvs={},
    )
    PackageOverlay.objects.create(
        suggestion=accepted,
        package_attribute="foo.tests",
        type=PackageOverlay.Type.IGNORED,
    )
    return {
        "pending": pending,
        "accepted": accepted,
        "rejected": rejected,
        "auto_reject": auto_reject,
    }


def test_training_data_unauthenticated() -> None:
    response = APIClient().get(url)
    assert response.status_code == 401


@pytest.mark.parametrize("user_fixture", ["user", "committer", "staff"])
def test_training_data_without_group_forbidden(
    user_fixture: str,
    request: pytest.FixtureRequest,
) -> None:
    user: User = request.getfixturevalue(user_fixture)
    client = APIClient()
    client.force_login(user)
    response = client.get(url)
    assert response.status_code == 403


def test_training_data_group_member_lists_curated_only(
    client: APIClient,
    curated_proposals: dict[str, CVEDerivationClusterProposal],
) -> None:
    response = client.get(url)
    assert response.status_code == 200
    assert response.data["count"] == 3

    cve_ids = {row["cve_id"] for row in response.data["results"]}
    assert "CVE-2026-pend" not in cve_ids
    assert cve_ids == {"CVE-2026-acc", "CVE-2026-rej", "CVE-2026-auto"}

    for result in response.data["results"]:
        assert result["status"] != "pending"
        assert result["schema_version"] == SCHEMA_VERSION


@pytest.mark.parametrize(
    "count",
    [0, 1, 10],
)
@pytest.mark.parametrize(
    "page_size",
    [1, 2, 10],
)
def test_training_data_pagination(
    client: APIClient,
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    count: int,
    page_size: int,
) -> None:
    for i in range(count):
        make_suggestion(
            container=make_container(cve_id=f"CVE-2026-page-{i}"),
            status=CVEDerivationClusterProposal.Status.ACCEPTED,
            algorithm_version=1,
        )

    page1 = client.get(url, {"page_size": page_size, "page": 1})
    assert page1.status_code == 200
    assert page1.data["count"] == count
    assert len(page1.data["results"]) == min(count, page_size)

    if count <= page_size:
        assert page1.data["next"] is None
        return

    assert page1.data["next"] is not None

    page2 = client.get(url, {"page_size": page_size, "page": 2})
    assert page2.status_code == 200
    assert len(page2.data["results"]) == min(page_size, count - page_size)
    assert page2.data["previous"] is not None
    if count > 2 * page_size:
        assert page2.data["next"] is not None
    else:
        assert page2.data["next"] is None
