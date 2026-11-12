"""
A package with several attribute paths is a single package: it shows up as one item, and every attribute path addresses that same package through the API.
"""

from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation
from shared.notify_users import create_package_subscription_notifications

NAME = "foo"
ATTRIBUTE = NAME
ALIAS = f"{NAME}Alias"
ATTRIBUTES = [ATTRIBUTE, ALIAS]

LIST_URL = reverse("cvederivationclusterproposal-list")
BULK_PACKAGES_URL = reverse("cvederivationclusterproposal-bulk-packages")
NOTIFICATIONS_URL = reverse("notifications-list")
SUBSCRIPTIONS_URL = "/api/v1/subscriptions/packages"


def detail_url(pk: int) -> str:
    return reverse("cvederivationclusterproposal-detail", kwargs={"pk": pk})


def packages_url(pk: int) -> str:
    return reverse("cvederivationclusterproposal-packages", kwargs={"pk": pk})


def other(attribute: str) -> str:
    """The other attribute path of the same package."""
    return ALIAS if attribute == ATTRIBUTE else ATTRIBUTE


@pytest.fixture
def make_aliased_suggestion(
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> Callable[..., CVEDerivationClusterProposal]:
    """
    A suggestion matching one package through two of its attribute paths: `<name>` and `<name>Alias`.
    """

    def wrapped(name: str = "package") -> CVEDerivationClusterProposal:
        return make_cached_suggestion(
            drvs={
                make_drv(pname=name, attribute=attribute): (
                    ProvenanceFlags.PACKAGE_NAME_MATCH
                )
                for attribute in [name, f"{name}Alias"]
            },
        )

    return wrapped


@pytest.fixture
def aliased_suggestion(
    make_aliased_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> CVEDerivationClusterProposal:
    return make_aliased_suggestion(NAME)


@pytest.fixture
def package(
    aliased_suggestion: CVEDerivationClusterProposal, anonymous_client: APIClient
) -> dict:
    """The package as the suggestion shows it, to compare the other endpoints against."""
    response = anonymous_client.get(detail_url(aliased_suggestion.pk))
    assert response.status_code == 200
    [package] = response.data["packages"]
    return package


def test_package_with_several_attributes_is_one_item(
    aliased_suggestion: CVEDerivationClusterProposal,
    package: dict,
    anonymous_client: APIClient,
) -> None:
    assert package["name"] == NAME
    assert [a["attrpath"] for a in package["attrpaths"]] == ATTRIBUTES

    detail = anonymous_client.get(detail_url(aliased_suggestion.pk)).data
    assert detail["original_packages"] == [package]
    assert detail["ignored_packages"] == []

    categorized = anonymous_client.get(packages_url(aliased_suggestion.pk)).data
    assert categorized["original"] == [package]
    assert categorized["active"] == [package]
    assert categorized["ignored"] == []


@pytest.mark.parametrize("attribute", ATTRIBUTES)
def test_list_filter_by_any_attribute_finds_the_package(
    attribute: str,
    aliased_suggestion: CVEDerivationClusterProposal,
    package: dict,
    anonymous_client: APIClient,
) -> None:
    response = anonymous_client.get(LIST_URL, {"package": attribute})
    assert response.status_code == 200
    [result] = response.data["results"]
    assert result["id"] == aliased_suggestion.pk
    assert result["packages"] == [package]


@pytest.mark.parametrize("attribute", ATTRIBUTES)
def test_ignore_by_any_attribute_and_restore_by_the_other(
    attribute: str,
    aliased_suggestion: CVEDerivationClusterProposal,
    package: dict,
    committer: User,
    client: APIClient,
) -> None:
    client.force_login(committer)
    response = client.patch(
        packages_url(aliased_suggestion.pk),
        {"package_attribute": attribute, "ignored": True},
        format="json",
    )
    assert response.status_code == 204
    categorized = client.get(packages_url(aliased_suggestion.pk)).data
    assert categorized["active"] == []
    assert categorized["ignored"] == [package]

    # The package is ignored as a whole, so neither attribute path can ignore it again.
    response = client.patch(
        packages_url(aliased_suggestion.pk),
        {"package_attribute": other(attribute), "ignored": True},
        format="json",
    )
    assert response.status_code == 400

    response = client.patch(
        packages_url(aliased_suggestion.pk),
        {"package_attribute": other(attribute), "ignored": False},
        format="json",
    )
    assert response.status_code == 204
    categorized = client.get(packages_url(aliased_suggestion.pk)).data
    assert categorized["active"] == [package]
    assert categorized["ignored"] == []


@pytest.mark.parametrize("attribute", ATTRIBUTES)
def test_bulk_ignore_by_any_attribute(
    attribute: str,
    make_aliased_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff_client: APIClient,
) -> None:
    suggestions = [make_aliased_suggestion(NAME) for _ in range(2)]
    response = staff_client.patch(
        f"{BULK_PACKAGES_URL}?package={attribute}",
        {"package_attribute": attribute, "ignored": True},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(suggestions)}
    for suggestion in suggestions:
        detail = staff_client.get(detail_url(suggestion.pk)).data
        assert detail["packages"] == []
        assert detail["ignored_packages"] == detail["original_packages"]
        [ignored] = detail["ignored_packages"]
        assert [a["attrpath"] for a in ignored["attrpaths"]] == ATTRIBUTES


@pytest.mark.parametrize("attribute", ATTRIBUTES)
def test_shared_state_reports_one_package_whichever_attribute_selects_it(
    attribute: str,
    make_aliased_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_aliased_suggestion(NAME)
    response = anonymous_client.get(
        LIST_URL, {"package": attribute, "shared_state": "true"}
    )
    assert response.status_code == 200
    # The package is reported once, under the attribute path that addresses it.
    assert response.data["shared"]["packages"] == [
        {"state": "active", "attribute": ATTRIBUTE}
    ]


@pytest.mark.parametrize("attribute", ATTRIBUTES)
def test_subscribing_to_any_attribute_matches_the_package(
    attribute: str,
    make_aliased_suggestion: Callable[..., CVEDerivationClusterProposal],
    user: User,
    client: APIClient,
    anonymous_client: APIClient,
) -> None:
    # Subscribing needs the attribute path to be known already.
    make_aliased_suggestion(NAME)
    response = client.post(
        SUBSCRIPTIONS_URL, {"package_name": attribute}, format="json"
    )
    assert response.status_code == 201

    suggestion = make_aliased_suggestion(NAME)
    create_package_subscription_notifications(suggestion)
    [package] = anonymous_client.get(detail_url(suggestion.pk)).data["packages"]

    response = client.get(NOTIFICATIONS_URL)
    assert response.status_code == 200
    notification = next(
        n for n in response.data["results"] if n["suggestion_id"] == suggestion.pk
    )
    assert notification["matching_subscribed_packages"] == [package]
