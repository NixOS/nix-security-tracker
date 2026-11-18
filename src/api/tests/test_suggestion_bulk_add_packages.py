from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from django.test import override_settings
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, PackageOverlay
from shared.models.nix_evaluation import NixDerivation
from shared.package_clustering import cluster_packages

URL = reverse("cvederivationclusterproposal-bulk-packages")

CVE_1 = "CVE-2025-1001"
CVE_2 = "CVE-2025-1002"


@pytest.fixture
def suggestions(
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> tuple[CVEDerivationClusterProposal, CVEDerivationClusterProposal]:
    return (
        make_cached_suggestion(container=make_container(cve_id=CVE_1)),
        make_cached_suggestion(container=make_container(cve_id=CVE_2)),
    )


@pytest.fixture
def extra_drvs(make_drv: Callable[..., NixDerivation]) -> list[NixDerivation]:
    drvs = [make_drv(pname="extra1"), make_drv(pname="extra2")]
    cluster_packages(NixDerivation.objects.filter(pk__in=[d.pk for d in drvs]))
    return drvs


def added(suggestion: CVEDerivationClusterProposal) -> set[str]:
    return set(
        suggestion.package_overlays.filter(
            type=PackageOverlay.Type.ADDITIONAL
        ).values_list("package_attribute", flat=True)
    )


def test_bulk_add_unauthenticated(
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
) -> None:
    response = APIClient().post(
        URL,
        {
            "additions": [
                {"suggestion_id": suggestions[0].pk, "package_attribute": "extra1"}
            ]
        },
        format="json",
    )
    assert response.status_code == 401


def test_bulk_add_non_committer(
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.post(
        URL,
        {
            "additions": [
                {"suggestion_id": suggestions[0].pk, "package_attribute": "extra1"}
            ]
        },
        format="json",
    )
    assert response.status_code == 403


def test_bulk_add_by_id_and_cve(
    committer_client: APIClient,
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
) -> None:
    s1, s2 = suggestions
    response = committer_client.post(
        URL,
        {
            "additions": [
                {"suggestion_id": s1.pk, "package_attribute": "extra1"},
                {"suggestion_id": s1.pk, "package_attribute": "extra2"},
                {"cve_id": CVE_2, "package_attribute": "extra2"},
            ]
        },
        format="json",
    )
    assert response.status_code == 200, response.data
    assert response.data == {"added": 3, "skipped": 0}

    assert added(s1) == {"extra1", "extra2"}
    assert added(s2) == {"extra2"}
    s1.cached.refresh_from_db()
    assert {"extra1", "extra2"} <= set(s1.cached.payload["packages"])


def test_bulk_add_is_idempotent(
    committer_client: APIClient,
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
) -> None:
    s1, _ = suggestions
    body = {
        "additions": [
            {"suggestion_id": s1.pk, "package_attribute": "extra1"},
            # Repeated in the same request.
            {"cve_id": CVE_1, "package_attribute": "extra1"},
        ]
    }
    response = committer_client.post(URL, body, format="json")
    assert response.data == {"added": 1, "skipped": 1}

    response = committer_client.post(URL, body, format="json")
    assert response.status_code == 200
    assert response.data == {"added": 0, "skipped": 2}
    assert added(s1) == {"extra1"}


def test_bulk_add_is_all_or_nothing(
    committer_client: APIClient,
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
    drv: NixDerivation,
) -> None:
    s1, s2 = suggestions
    response = committer_client.post(
        URL,
        {
            "additions": [
                {"suggestion_id": s1.pk, "package_attribute": "extra1"},
                {"suggestion_id": s1.pk, "package_attribute": "does-not-exist"},
                {"cve_id": "CVE-2025-9999", "package_attribute": "extra1"},
                {"suggestion_id": s2.pk + 1000, "package_attribute": "extra1"},
                # Already among the packages the matcher found.
                {"suggestion_id": s2.pk, "package_attribute": drv.attribute},
            ]
        },
        format="json",
    )
    assert response.status_code == 400
    assert set(response.data["reasons"]) == {"1", "2", "3", "4"}
    assert "package_attribute" in response.data["reasons"]["1"]
    assert "cve_id" in response.data["reasons"]["2"]
    assert "suggestion" in response.data["reasons"]["3"]
    assert "package_attribute" in response.data["reasons"]["4"]

    assert added(s1) == set()
    assert added(s2) == set()


def test_bulk_add_cve_resolution_error_writes_nothing(
    committer_client: APIClient,
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
) -> None:
    """Valid additions are not applied when another one names an unknown CVE."""
    s1, _ = suggestions
    response = committer_client.post(
        URL,
        {
            "additions": [
                {"suggestion_id": s1.pk, "package_attribute": "extra1"},
                {"cve_id": "CVE-2025-9999", "package_attribute": "extra1"},
            ]
        },
        format="json",
    )
    assert response.status_code == 400
    assert set(response.data["reasons"]) == {"1"}
    assert added(s1) == set()


@pytest.mark.parametrize(
    "addition",
    [
        {"package_attribute": "extra1"},
        {"suggestion_id": 1, "cve_id": CVE_1, "package_attribute": "extra1"},
    ],
)
def test_bulk_add_requires_exactly_one_identifier(
    committer_client: APIClient,
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    addition: dict,
) -> None:
    response = committer_client.post(URL, {"additions": [addition]}, format="json")
    assert response.status_code == 400


def test_bulk_add_records_activity(
    committer_client: APIClient,
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
    committer: User,
) -> None:
    s1, _ = suggestions
    committer_client.post(
        URL,
        {
            "additions": [
                {"suggestion_id": s1.pk, "package_attribute": "extra1"},
                {"suggestion_id": s1.pk, "package_attribute": "extra2"},
            ]
        },
        format="json",
    )
    response = committer_client.get(
        reverse("cvederivationclusterproposal-detail", kwargs={"pk": s1.pk}),
        {"activity_log": "true"},
    )
    entry = next(
        e for e in response.data["activity_log"] if e["action"] == "package.add"
    )
    assert sorted(entry["package_names"]) == ["extra1", "extra2"]
    assert entry["username"] == committer.username


@override_settings(API_BULK_MAX_AFFECTED=1)
def test_bulk_add_too_many(
    committer_client: APIClient,
    suggestions: tuple[CVEDerivationClusterProposal, ...],
    extra_drvs: list[NixDerivation],
) -> None:
    s1, _ = suggestions
    response = committer_client.post(
        URL,
        {
            "additions": [
                {"suggestion_id": s1.pk, "package_attribute": "extra1"},
                {"suggestion_id": s1.pk, "package_attribute": "extra2"},
            ]
        },
        format="json",
    )
    assert response.status_code == 400
    assert added(s1) == set()
