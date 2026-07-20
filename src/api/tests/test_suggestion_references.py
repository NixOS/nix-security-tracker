from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal

REFERENCE_URL = "https://example.com/advisory"
REFERENCE_NAME = "Advisory"


def url(id: int) -> str:
    return reverse("cvederivationclusterproposal-references", kwargs={"pk": id})


@pytest.fixture
def suggestion_with_reference(
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> CVEDerivationClusterProposal:
    container = make_container(references=[(REFERENCE_NAME, REFERENCE_URL, [])])
    return make_cached_suggestion(container=container)


def test_get_references_anonymous(
    suggestion_with_reference: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.get(url(suggestion_with_reference.pk))
    assert response.status_code == 200
    data = response.data
    assert "original" in data
    assert "active" in data
    assert "ignored" in data
    assert any(r["url"] == REFERENCE_URL for r in data["original"])
    assert any(r["url"] == REFERENCE_URL for r in data["active"])
    assert data["ignored"] == []


def test_get_references_not_found(
    suggestion_with_reference: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.get(url(suggestion_with_reference.pk + 1))
    assert response.status_code == 404


def test_patch_ignore_unauthenticated(
    suggestion_with_reference: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": True},
        format="json",
    )
    assert response.status_code == 401


def test_patch_ignore_non_committer(
    suggestion_with_reference: CVEDerivationClusterProposal,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": True},
        format="json",
    )
    assert response.status_code == 403


def test_patch_ignore_reference_not_found(
    suggestion_with_reference: CVEDerivationClusterProposal,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": f"{REFERENCE_URL}/some_suffix", "ignored": True},
        format="json",
    )
    assert response.status_code == 400


def test_patch_ignore_reference_success(
    suggestion_with_reference: CVEDerivationClusterProposal,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": True},
        format="json",
    )
    assert response.status_code == 204

    # Verify the reference moved to ignored
    get_response = client.get(url(suggestion_with_reference.pk))
    assert get_response.status_code == 200
    data = get_response.data
    assert not any(r["url"] == REFERENCE_URL for r in data["active"])
    assert any(r["url"] == REFERENCE_URL for r in data["ignored"])


def test_patch_ignore_reference_already_ignored(
    suggestion_with_reference: CVEDerivationClusterProposal,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    # First ignore
    client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": True},
        format="json",
    )
    # Second ignore should fail
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": True},
        format="json",
    )
    assert response.status_code == 400


def test_patch_restore_unauthenticated(
    suggestion_with_reference: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": False},
        format="json",
    )
    assert response.status_code == 401


def test_patch_restore_non_committer(
    suggestion_with_reference: CVEDerivationClusterProposal,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": False},
        format="json",
    )
    assert response.status_code == 403


def test_patch_restore_reference_not_in_ignored(
    suggestion_with_reference: CVEDerivationClusterProposal,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    # Not yet ignored, so restoring should fail
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": False},
        format="json",
    )
    assert response.status_code == 400


def test_patch_restore_reference_success(
    suggestion_with_reference: CVEDerivationClusterProposal,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    # First ignore
    client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": True},
        format="json",
    )
    # Then restore
    response = client.patch(
        url(suggestion_with_reference.pk),
        {"reference_url": REFERENCE_URL, "ignored": False},
        format="json",
    )
    assert response.status_code == 204

    # Verify the reference is back in active
    get_response = client.get(url(suggestion_with_reference.pk))
    assert get_response.status_code == 200
    data = get_response.data
    assert any(r["url"] == REFERENCE_URL for r in data["active"])
    assert not any(r["url"] == REFERENCE_URL for r in data["ignored"])
