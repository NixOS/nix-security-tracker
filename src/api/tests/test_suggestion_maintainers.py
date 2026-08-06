from django.contrib.auth.models import User
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixMaintainer


def url(id: int) -> str:
    return reverse("cvederivationclusterproposal-maintainers", kwargs={"pk": id})


def test_get_maintainers_anonymous(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
) -> None:
    client = APIClient()
    response = client.get(url(cached_suggestion.pk))
    assert response.status_code == 200
    data = response.data
    assert "original" in data
    assert "active" in data
    assert "ignored" in data
    assert "added" in data
    assert "orphan" in data
    assert any(m["github_id"] == maintainer.github_id for m in data["original"])
    assert any(m["github_id"] == maintainer.github_id for m in data["active"])
    assert data["ignored"] == []
    assert data["orphan"] == []


def test_get_maintainers_not_found(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.get(url(cached_suggestion.pk + 1))
    assert response.status_code == 404


def test_patch_ignore_unauthenticated(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
) -> None:
    client = APIClient()
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    assert response.status_code == 401


def test_patch_ignore_non_committer(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    assert response.status_code == 403


def test_patch_ignore_maintainer_not_found(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id + 1, "ignored": True},
        format="json",
    )
    assert response.status_code == 400


def test_patch_ignore_maintainer_success(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    assert response.status_code == 204

    # Verify the maintainer moved to ignored
    get_response = client.get(url(cached_suggestion.pk))
    assert get_response.status_code == 200
    data = get_response.data
    assert not any(m["github_id"] == maintainer.github_id for m in data["active"])
    assert any(m["github_id"] == maintainer.github_id for m in data["ignored"])


def test_patch_ignore_maintainer_already_ignored(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    # First ignore
    client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    # Second ignore should fail
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    assert response.status_code == 400


def test_patch_restore_unauthenticated(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
) -> None:
    client = APIClient()
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": False},
        format="json",
    )
    assert response.status_code == 401


def test_patch_restore_non_committer(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": False},
        format="json",
    )
    assert response.status_code == 403


def test_patch_restore_maintainer_not_in_ignored(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    # Not yet ignored, so restoring should fail
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": False},
        format="json",
    )
    assert response.status_code == 400


def test_patch_restore_maintainer_success(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    # First ignore
    client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": True},
        format="json",
    )
    # Then restore
    response = client.patch(
        url(cached_suggestion.pk),
        {"github_id": maintainer.github_id, "ignored": False},
        format="json",
    )
    assert response.status_code == 204

    # Verify the maintainer is back in active
    get_response = client.get(url(cached_suggestion.pk))
    assert get_response.status_code == 200
    data = get_response.data
    assert any(m["github_id"] == maintainer.github_id for m in data["active"])
    assert not any(m["github_id"] == maintainer.github_id for m in data["ignored"])
