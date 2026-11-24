from collections.abc import Callable

import pytest
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation, NixMaintainer

PACKAGE_ATTRIBUTE_1 = "package1"
PACKAGE_ATTRIBUTE_2 = "package2"
PACKAGE_ATTRIBUTE_NON_EXISTING = "foo"


def url(id: int) -> str:
    return reverse("cvederivationclusterproposal-packages", kwargs={"pk": id})


@pytest.fixture
def suggestion_with_packages(
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> CVEDerivationClusterProposal:
    drv1 = make_drv(pname=PACKAGE_ATTRIBUTE_1)
    drv2 = make_drv(pname=PACKAGE_ATTRIBUTE_2)
    return make_cached_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )


def test_get_packages_anonymous(
    anonymous_client: APIClient,
    suggestion_with_packages: CVEDerivationClusterProposal,
) -> None:
    response = anonymous_client.get(url(suggestion_with_packages.pk))
    assert response.status_code == 200
    data = response.data
    assert data[PACKAGE_ATTRIBUTE_1]["status"] == "active"
    assert "branches" in data[PACKAGE_ATTRIBUTE_1]["package"]


def test_get_packages_not_found(
    anonymous_client: APIClient,
    suggestion_with_packages: CVEDerivationClusterProposal,
) -> None:
    response = anonymous_client.get(url(suggestion_with_packages.pk + 1))
    assert response.status_code == 404


def test_patch_ignore_unauthenticated(
    anonymous_client: APIClient,
    suggestion_with_packages: CVEDerivationClusterProposal,
) -> None:
    response = anonymous_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    assert response.status_code == 401


def test_patch_ignore_non_committer(
    suggestion_with_packages: CVEDerivationClusterProposal,
    client: APIClient,
) -> None:
    response = client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    assert response.status_code == 403


def test_patch_ignore_package_not_found(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_NON_EXISTING], "ignored": True},
        format="json",
    )
    assert response.status_code == 400


def test_patch_ignore_package_success(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    assert response.status_code == 204

    # Verify the package moved to ignored
    get_response = committer_client.get(url(suggestion_with_packages.pk))
    assert get_response.status_code == 200
    data = get_response.data
    assert data[PACKAGE_ATTRIBUTE_1]["status"] == "ignored"


def test_patch_ignore_package_already_ignored(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    # First ignore
    committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    # Second ignore should fail
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    assert response.status_code == 400


def test_patch_restore_unauthenticated(
    anonymous_client: APIClient,
    suggestion_with_packages: CVEDerivationClusterProposal,
) -> None:
    response = anonymous_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": False},
        format="json",
    )
    assert response.status_code == 401


def test_patch_restore_non_committer(
    suggestion_with_packages: CVEDerivationClusterProposal,
    client: APIClient,
) -> None:
    response = client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": False},
        format="json",
    )
    assert response.status_code == 403


def test_patch_restore_package_not_ignored(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    # Not yet ignored, so restoring should fail
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": False},
        format="json",
    )
    assert response.status_code == 400


def test_patch_restore_package_success(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    # First ignore
    committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    # Then restore
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": False},
        format="json",
    )
    assert response.status_code == 204

    # Verify the package is back in active
    get_response = committer_client.get(url(suggestion_with_packages.pk))
    assert get_response.status_code == 200
    data = get_response.data
    assert data[PACKAGE_ATTRIBUTE_1]["status"] == "active"


def test_patch_ignore_restore_package_updates_maintainer_orphan_status(
    committer_client: APIClient,
    make_maintainer: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Ignoring the only active package a maintainer is associated with marks them as orphan."""
    only_maintainer_of_package1 = make_maintainer(github_id=999, github="solo")
    drv1 = make_drv(pname=PACKAGE_ATTRIBUTE_1, maintainer=only_maintainer_of_package1)
    drv2 = make_drv(pname=PACKAGE_ATTRIBUTE_2)
    suggestion = make_cached_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    suggestion_url = reverse(
        "cvederivationclusterproposal-detail", kwargs={"pk": suggestion.pk}
    )
    key = str(only_maintainer_of_package1.github_id)

    before = committer_client.get(suggestion_url)
    assert before.data["maintainers"][key]["status"] == "active"
    assert not before.data["maintainers"][key]["orphan"]

    response = committer_client.patch(
        url(suggestion.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    assert response.status_code == 204

    after_ignore = committer_client.get(suggestion_url)
    # The maintainer stays active (it was never itself ignored), but becomes orphan since it no longer has any active package.
    assert after_ignore.data["maintainers"][key]["status"] == "active"
    assert after_ignore.data["maintainers"][key]["orphan"]

    # Restoring the package clears the orphan flag.
    response = committer_client.patch(
        url(suggestion.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": False},
        format="json",
    )
    assert response.status_code == 204

    after_restore = committer_client.get(suggestion_url)
    assert after_restore.data["maintainers"][key]["status"] == "active"
    assert not after_restore.data["maintainers"][key]["orphan"]


def test_restore_package_brings_back_maintainer_ignored_while_orphaned(
    committer_client: APIClient,
    make_maintainer: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Regression test: a maintainer ignored while orphan (i.e. while their last active package was ignored) stays ignored once that package is restored.
    """
    only_maintainer_of_package1 = make_maintainer(github_id=999, github="solo")
    drv1 = make_drv(pname=PACKAGE_ATTRIBUTE_1, maintainer=only_maintainer_of_package1)
    drv2 = make_drv(pname=PACKAGE_ATTRIBUTE_2)
    suggestion = make_cached_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    suggestion_url = reverse(
        "cvederivationclusterproposal-detail", kwargs={"pk": suggestion.pk}
    )
    maintainers_url = reverse(
        "cvederivationclusterproposal-maintainers", kwargs={"pk": suggestion.pk}
    )

    # Ignore package1, its only maintainer becomes orphan.
    response = committer_client.patch(
        url(suggestion.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    assert response.status_code == 204

    # Ignore the (now orphan) maintainer directly.
    response = committer_client.patch(
        maintainers_url,
        {"github_id": only_maintainer_of_package1.github_id, "ignored": True},
        format="json",
    )
    assert response.status_code == 204

    # Restore package1: the maintainer should come back as `ignored`, not `active`.
    response = committer_client.patch(
        url(suggestion.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": False},
        format="json",
    )
    assert response.status_code == 204

    after_restore = committer_client.get(suggestion_url)
    entry = after_restore.data["maintainers"][
        str(only_maintainer_of_package1.github_id)
    ]
    assert entry["status"] == "ignored"
    assert not entry["orphan"]


def test_patch_ignore_and_restore_several_packages_at_once(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    both = [PACKAGE_ATTRIBUTE_1, PACKAGE_ATTRIBUTE_2]

    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": both, "ignored": True},
        format="json",
    )
    assert response.status_code == 204
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert {attribute: data[attribute]["status"] for attribute in both} == {
        attribute: "ignored" for attribute in both
    }

    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": both, "ignored": False},
        format="json",
    )
    assert response.status_code == 204
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert {attribute: data[attribute]["status"] for attribute in both} == {
        attribute: "active" for attribute in both
    }


def test_patch_ignore_several_packages_with_duplicates(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {
            "package_attributes": [PACKAGE_ATTRIBUTE_1, PACKAGE_ATTRIBUTE_1],
            "ignored": True,
        },
        format="json",
    )
    assert response.status_code == 204
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert data[PACKAGE_ATTRIBUTE_1]["status"] == "ignored"


@pytest.mark.parametrize(
    "package_attributes",
    [
        [PACKAGE_ATTRIBUTE_2, PACKAGE_ATTRIBUTE_NON_EXISTING],
        [PACKAGE_ATTRIBUTE_2, PACKAGE_ATTRIBUTE_1],
    ],
    ids=["one-unknown", "one-already-ignored"],
)
def test_patch_ignore_several_packages_refused_by_one_changes_nothing(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
    package_attributes: list[str],
) -> None:
    suggestion_with_packages.ignore_packages([PACKAGE_ATTRIBUTE_1])
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": package_attributes, "ignored": True},
        format="json",
    )
    assert response.status_code == 400
    assert "package_attributes" in response.data
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert data[PACKAGE_ATTRIBUTE_2]["status"] == "active"


def test_patch_restore_several_packages_refused_by_one_changes_nothing(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    suggestion_with_packages.ignore_packages([PACKAGE_ATTRIBUTE_1])
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {
            "package_attributes": [PACKAGE_ATTRIBUTE_1, PACKAGE_ATTRIBUTE_2],
            "ignored": False,
        },
        format="json",
    )
    assert response.status_code == 400
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert data[PACKAGE_ATTRIBUTE_1]["status"] == "ignored"


def test_patch_packages_refuses_an_empty_list(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": [], "ignored": True},
        format="json",
    )
    assert response.status_code == 400
