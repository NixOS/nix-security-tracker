from collections.abc import Callable
from urllib.parse import urlencode

import pytest
from django.contrib.auth.models import User
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.cache_suggestions import cache_new_suggestions
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation, NixMaintainer
from shared.package_clustering import cluster_packages

PACKAGE_ATTRIBUTE_1 = "package1"
PACKAGE_ATTRIBUTE_2 = "package2"
PACKAGE_ATTRIBUTE_NON_EXISTING = "does-not-exist"


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
    assert "original" in data
    assert "active" in data
    assert "ignored" in data
    assert PACKAGE_ATTRIBUTE_1 in data["original"]
    assert PACKAGE_ATTRIBUTE_1 in data["active"]
    assert data["ignored"] == {}


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
    assert PACKAGE_ATTRIBUTE_1 not in data["active"]
    assert PACKAGE_ATTRIBUTE_1 in data["ignored"]


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
    assert PACKAGE_ATTRIBUTE_1 in data["active"]
    assert PACKAGE_ATTRIBUTE_1 not in data["ignored"]


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
    before = committer_client.get(suggestion_url)
    maintainer_github_ids_before = {
        m["github_id"] for m in before.data["categorized_maintainers"]["active"]
    }
    orphan_github_ids_before = {
        m["github_id"] for m in before.data["categorized_maintainers"]["orphan"]
    }
    assert only_maintainer_of_package1.github_id in maintainer_github_ids_before
    assert only_maintainer_of_package1.github_id not in orphan_github_ids_before

    response = committer_client.patch(
        url(suggestion.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": True},
        format="json",
    )
    assert response.status_code == 204

    after_ignore = committer_client.get(suggestion_url)
    # The maintainer stays in `active` (it was never itself ignored)...
    maintainer_github_ids_after_ignore = {
        m["github_id"] for m in after_ignore.data["categorized_maintainers"]["active"]
    }
    assert only_maintainer_of_package1.github_id in maintainer_github_ids_after_ignore
    # ...but becomes orphan since it no longer has any active package.
    orphan_github_ids_after_ignore = {
        m["github_id"] for m in after_ignore.data["categorized_maintainers"]["orphan"]
    }
    assert only_maintainer_of_package1.github_id in orphan_github_ids_after_ignore

    # Restoring the package clears the orphan status.
    response = committer_client.patch(
        url(suggestion.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_1], "ignored": False},
        format="json",
    )
    assert response.status_code == 204

    after_restore = committer_client.get(suggestion_url)
    orphan_github_ids_after_restore = {
        m["github_id"] for m in after_restore.data["categorized_maintainers"]["orphan"]
    }
    maintainer_github_ids_after_restore = {
        m["github_id"] for m in after_restore.data["categorized_maintainers"]["active"]
    }
    assert only_maintainer_of_package1.github_id not in orphan_github_ids_after_restore
    assert only_maintainer_of_package1.github_id in maintainer_github_ids_after_restore


def test_restore_package_brings_back_maintainer_ignored_while_orphaned(
    committer_client: APIClient,
    make_maintainer: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Regression test: a maintainer ignored while orphan (i.e. while their
    last active package was ignored) must reappear in `ignored`, not
    `active`, once that package is restored."""
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
    categorized = after_restore.data["categorized_maintainers"]
    active_ids = {m["github_id"] for m in categorized["active"]}
    ignored_ids = {m["github_id"] for m in categorized["ignored"]}
    orphan_ids = {m["github_id"] for m in categorized["orphan"]}
    assert only_maintainer_of_package1.github_id in ignored_ids
    assert only_maintainer_of_package1.github_id not in active_ids
    assert only_maintainer_of_package1.github_id not in orphan_ids


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
    assert data["active"] == {}
    assert set(data["ignored"]) == set(both)

    response = committer_client.patch(
        url(suggestion_with_packages.pk),
        {"package_attributes": both, "ignored": False},
        format="json",
    )
    assert response.status_code == 204
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert set(data["active"]) == set(both)
    assert data["ignored"] == {}


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
    assert (
        PACKAGE_ATTRIBUTE_1
        in committer_client.get(url(suggestion_with_packages.pk)).data["ignored"]
    )


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
    assert (
        PACKAGE_ATTRIBUTE_2
        in committer_client.get(url(suggestion_with_packages.pk)).data["active"]
    )


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
    assert (
        PACKAGE_ATTRIBUTE_1
        in committer_client.get(url(suggestion_with_packages.pk)).data["ignored"]
    )


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


@pytest.fixture
def extra_drv(make_drv: Callable[..., NixDerivation]) -> NixDerivation:
    drv = make_drv(pname="extra")
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))
    return drv


@pytest.fixture
def extra_drv_2(make_drv: Callable[..., NixDerivation]) -> NixDerivation:
    drv = make_drv(pname="extra2")
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))
    return drv


def test_post_add_package_unauthenticated(
    suggestion_with_packages: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    client = APIClient()
    response = client.post(
        url(suggestion_with_packages.pk),
        {"package_attributes": [extra_drv.attribute]},
        format="json",
    )
    assert response.status_code == 401


def test_post_add_package_non_committer(
    suggestion_with_packages: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.post(
        url(suggestion_with_packages.pk),
        {"package_attributes": [extra_drv.attribute]},
        format="json",
    )
    assert response.status_code == 403


def test_post_add_package_unknown(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    response = committer_client.post(
        url(suggestion_with_packages.pk),
        {"package_attributes": [PACKAGE_ATTRIBUTE_NON_EXISTING]},
        format="json",
    )
    assert response.status_code == 400


def test_add_and_delete_package(
    suggestion_with_packages: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    committer_client: APIClient,
) -> None:
    response = committer_client.post(
        url(suggestion_with_packages.pk),
        {"package_attributes": [extra_drv.attribute]},
        format="json",
    )
    assert response.status_code == 204

    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert extra_drv.attribute in data["active"]
    assert extra_drv.attribute in data["added"]
    assert extra_drv.attribute not in data["original"]
    assert extra_drv.attribute not in data["ignored"]

    detail = committer_client.get(
        reverse(
            "cvederivationclusterproposal-detail",
            kwargs={"pk": suggestion_with_packages.pk},
        )
    ).data
    assert set(detail["added_packages"]) == {extra_drv.attribute}

    response = committer_client.delete(
        url(suggestion_with_packages.pk) + f"?package_attributes={extra_drv.attribute}"
    )
    assert response.status_code == 204

    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert extra_drv.attribute not in data["active"]
    assert data["added"] == {}


def test_delete_package_not_added(
    suggestion_with_packages: CVEDerivationClusterProposal,
    committer_client: APIClient,
) -> None:
    response = committer_client.delete(
        url(suggestion_with_packages.pk) + f"?package_attributes={PACKAGE_ATTRIBUTE_1}"
    )
    assert response.status_code == 400


def test_add_and_delete_several_packages_at_once(
    suggestion_with_packages: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    extra_drv_2: NixDerivation,
    committer_client: APIClient,
) -> None:
    both = [extra_drv.attribute, extra_drv_2.attribute]
    response = committer_client.post(
        url(suggestion_with_packages.pk),
        {"package_attributes": both},
        format="json",
    )
    assert response.status_code == 204
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert set(data["added"]) == set(both)

    response = committer_client.delete(
        url(suggestion_with_packages.pk)
        + "?"
        + urlencode({"package_attributes": both}, doseq=True)
    )
    assert response.status_code == 204
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert data["added"] == {}


def test_add_several_packages_refused_by_one_changes_nothing(
    suggestion_with_packages: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    committer_client: APIClient,
) -> None:
    response = committer_client.post(
        url(suggestion_with_packages.pk),
        {
            "package_attributes": [
                extra_drv.attribute,
                PACKAGE_ATTRIBUTE_NON_EXISTING,
            ]
        },
        format="json",
    )
    assert response.status_code == 400
    assert "package_attributes" in response.data
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert data["added"] == {}


def test_added_package_found_by_matcher_is_still_listed_as_added(
    suggestion_with_packages: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    committer_client: APIClient,
) -> None:
    """After a rematch finds an added package, it can still be deleted rather than getting stuck."""
    suggestion_with_packages.add_packages([extra_drv.attribute])
    DerivationClusterProposalLink.objects.filter(
        proposal=suggestion_with_packages, derivation=extra_drv
    ).update(
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH | ProvenanceFlags.MANUAL
    )
    cache_new_suggestions(suggestion_with_packages)

    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert extra_drv.attribute in data["original"]
    assert extra_drv.attribute in data["added"]
    assert extra_drv.attribute not in data["ignored"]
    detail = committer_client.get(
        reverse(
            "cvederivationclusterproposal-detail",
            kwargs={"pk": suggestion_with_packages.pk},
        )
    ).data
    assert extra_drv.attribute in detail["added_packages"]
    listed = committer_client.get(reverse("cvederivationclusterproposal-list")).data
    (item,) = [s for s in listed["results"] if s["id"] == suggestion_with_packages.pk]
    assert extra_drv.attribute in item["added_packages"]

    response = committer_client.delete(
        url(suggestion_with_packages.pk) + f"?package_attributes={extra_drv.attribute}"
    )
    assert response.status_code == 204
    data = committer_client.get(url(suggestion_with_packages.pk)).data
    assert extra_drv.attribute in data["active"]
    assert data["added"] == {}
