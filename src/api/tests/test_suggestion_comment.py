from collections.abc import Callable

from django.contrib.auth.models import User
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal


def url(id: int) -> str:
    return reverse("cvederivationclusterproposal-comment", kwargs={"pk": id})


def test_get_comment_anonymous_no_comment(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.get(url(cached_suggestion.pk))
    assert response.status_code == 200
    assert response.data == {"comment": None}


def test_get_comment_anonymous_with_comment(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(comment="foo")
    client = APIClient()
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200
    assert response.data == {"comment": "foo"}


def test_get_comment_not_found(cached_suggestion: CVEDerivationClusterProposal) -> None:
    client = APIClient()
    response = client.get(url(cached_suggestion.pk + 1))
    assert response.status_code == 404


def test_patch_comment_unauthenticated(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    client = APIClient()
    response = client.patch(
        url(cached_suggestion.pk), {"comment": "foo"}, format="json"
    )
    assert response.status_code == 401


def test_patch_comment_non_comitter(
    cached_suggestion: CVEDerivationClusterProposal,
    user: User,
) -> None:
    client = APIClient()
    client.force_login(user)
    response = client.patch(
        url(cached_suggestion.pk), {"comment": "foo"}, format="json"
    )
    assert response.status_code == 403


def test_patch_comment_sets_value(
    cached_suggestion: CVEDerivationClusterProposal,
    committer: User,
) -> None:
    client = APIClient()
    client.force_login(committer)
    response = client.patch(
        url(cached_suggestion.pk), {"comment": "foo"}, format="json"
    )
    assert response.status_code == 200
    assert response.data == {"comment": "foo"}
    response = client.get(url(cached_suggestion.pk))
    assert response.status_code == 200
    assert response.data == {"comment": "foo"}


def test_patch_comment_clears_with_empty_string(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    committer: User,
) -> None:
    suggestion = make_cached_suggestion(comment="foo")
    client = APIClient()
    client.force_login(committer)
    response = client.patch(url(suggestion.pk), {"comment": ""}, format="json")
    assert response.status_code == 200
    assert response.data == {"comment": None}
    response = client.get(url(suggestion.pk))
    assert response.status_code == 200
    assert response.data == {"comment": None}


def test_patch_comment_not_found(
    cached_suggestion: CVEDerivationClusterProposal, committer: User
) -> None:
    client = APIClient()
    client.force_login(committer)
    response = client.patch(
        url(cached_suggestion.pk + 1), {"comment": "foo"}, format="json"
    )
    assert response.status_code == 404
