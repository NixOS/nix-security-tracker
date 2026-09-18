from collections.abc import Callable

from django.contrib.auth.models import User
from pytest_mock import MockerFixture
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


def test_post_add_unauthenticated(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.post(
        url(cached_suggestion.pk),
        {"github_handle": "alice"},
        format="json",
    )
    assert response.status_code == 401


def test_post_add_non_committer(
    cached_suggestion: CVEDerivationClusterProposal,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.post(
        url(cached_suggestion.pk),
        {"github_handle": "alice"},
        format="json",
    )
    assert response.status_code == 403


def test_post_add_already_maintainer(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    response = client.post(
        url(cached_suggestion.pk),
        {"github_handle": maintainer.github},
        format="json",
    )
    assert response.status_code == 400


def test_post_add_existing_db_maintainer_success(
    cached_suggestion: CVEDerivationClusterProposal,
    committer: User,
    make_maintainer: Callable[..., NixMaintainer],
) -> None:
    make_maintainer(github_id=555, github="alice", name="Alice DeBob")
    client = APIClient()
    client.force_login(committer)
    response = client.post(
        url(cached_suggestion.pk),
        {"github_handle": "alice"},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["github_id"] == 555

    get_response = client.get(url(cached_suggestion.pk))
    assert get_response.status_code == 200
    assert any(m["github_id"] == 555 for m in get_response.data["added"])


def test_post_add_from_github_success(
    cached_suggestion: CVEDerivationClusterProposal,
    committer: User,
    mocker: MockerFixture,
) -> None:
    mocker.patch(
        "shared.github.fetch_user_info",
        return_value={
            "id": 555,
            "login": "alice",
            "name": "Alice DeBob",
            "email": "alice@somewhere.com",
        },
    )
    client = APIClient()
    client.force_login(committer)
    response = client.post(
        url(cached_suggestion.pk),
        {"github_handle": "alice"},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["github_id"] == 555
    assert NixMaintainer.objects.filter(github_id=555, github="alice").exists()


def test_post_add_maintainer_not_found_on_github(
    cached_suggestion: CVEDerivationClusterProposal,
    committer: User,
    mocker: MockerFixture,
) -> None:
    mocker.patch("shared.github.fetch_user_info", return_value=None)
    client = APIClient()
    client.force_login(committer)
    response = client.post(
        url(cached_suggestion.pk),
        {"github_handle": "unknown"},
        format="json",
    )
    assert response.status_code == 400


def test_delete_unauthenticated(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.delete(f"{url(cached_suggestion.pk)}?github_id=555")
    assert response.status_code == 401


def test_delete_non_committer(
    cached_suggestion: CVEDerivationClusterProposal,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.delete(f"{url(cached_suggestion.pk)}?github_id=555")
    assert response.status_code == 403


def test_delete_not_an_added_maintainer(
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
    committer: User,
) -> None:
    """Original (non manually-added) maintainers cannot be deleted."""
    client = APIClient()
    client.force_login(committer)
    response = client.delete(
        f"{url(cached_suggestion.pk)}?github_id={maintainer.github_id}"
    )
    assert response.status_code == 400


def test_delete_added_maintainer_success(
    cached_suggestion: CVEDerivationClusterProposal,
    committer: User,
    make_maintainer: Callable[..., NixMaintainer],
) -> None:
    make_maintainer(github_id=555, github="alice", name="Alice DeBob")
    client = APIClient()
    client.force_login(committer)
    client.post(url(cached_suggestion.pk), {"github_handle": "alice"}, format="json")

    response = client.delete(f"{url(cached_suggestion.pk)}?github_id=555")
    assert response.status_code == 204

    get_response = client.get(url(cached_suggestion.pk))
    assert get_response.status_code == 200
    assert not any(m["github_id"] == 555 for m in get_response.data["added"])


def test_delete_already_removed_maintainer(
    cached_suggestion: CVEDerivationClusterProposal,
    committer: User,
    make_maintainer: Callable[..., NixMaintainer],
) -> None:
    make_maintainer(github_id=555, github="alice", name="Alice DeBob")
    client = APIClient()
    client.force_login(committer)
    client.post(url(cached_suggestion.pk), {"github_handle": "alice"}, format="json")
    client.delete(f"{url(cached_suggestion.pk)}?github_id=555")

    response = client.delete(f"{url(cached_suggestion.pk)}?github_id=555")
    assert response.status_code == 400
