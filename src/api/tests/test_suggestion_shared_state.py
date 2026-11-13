from collections.abc import Callable

import pytest
from django.test import override_settings
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation, NixMaintainer

REFERENCE_URL = "https://example.com/advisory"
REFERENCE_NAME = "Advisory"

LIST_URL = reverse("cvederivationclusterproposal-list")
SHARED_STATE_URL = reverse("cvederivationclusterproposal-bulk-shared-state")
PACKAGES_URL = reverse("cvederivationclusterproposal-bulk-packages")

# A filter that selects everything, since an unfiltered selection has no shared state.
EVERYTHING = "created_at_after=2000-01-01"


def shared_state(client: APIClient, query: str = EVERYTHING) -> dict:
    """The shared state reported for a selection."""
    response = client.get(f"{SHARED_STATE_URL}?{query}")
    assert response.status_code == 200
    return response.data


def test_shared_state_of_unfiltered_selection_is_refused(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion()
    response = anonymous_client.get(SHARED_STATE_URL)
    assert response.status_code == 400
    assert "requires at least one filter" in response.data["detail"]


def test_shared_state_of_a_single_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
    anonymous_client: APIClient,
) -> None:
    """A selection of one shares everything it holds."""
    make_cached_suggestion(comment="foo")
    state = shared_state(anonymous_client)
    assert state is not None
    assert state["comment"] == "foo"
    assert state["packages"] == [{"state": "active", "attribute": drv.attribute}]


def test_shared_state_of_an_empty_selection(
    db: None,
    anonymous_client: APIClient,
) -> None:
    assert shared_state(anonymous_client) == {
        "status": None,
        "in_issue_draft": None,
        "comment": None,
        "packages": [],
        "maintainers": [],
        "references": [],
    }


@override_settings(API_BULK_MAX_AFFECTED=1)
def test_shared_state_of_a_selection_larger_than_the_bulk_cap(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    """Beyond what a bulk operation may affect, the shared state is refused."""
    for _ in range(2):
        make_cached_suggestion()
    response = anonymous_client.get(f"{SHARED_STATE_URL}?{EVERYTHING}")
    assert response.status_code == 400
    assert "more than the 1" in response.data["detail"]


@override_settings(API_BULK_MAX_AFFECTED=1)
def test_shared_state_of_a_selection_narrowed_down_to_the_bulk_cap(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion()
    make_cached_suggestion(status=CVEDerivationClusterProposal.Status.ACCEPTED)
    assert shared_state(anonymous_client, "status=accepted")["status"] == (
        CVEDerivationClusterProposal.Status.ACCEPTED
    )


def test_shared_status_of_a_uniform_selection(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion(status=CVEDerivationClusterProposal.Status.ACCEPTED)
    assert shared_state(anonymous_client)["status"] == (
        CVEDerivationClusterProposal.Status.ACCEPTED
    )


def test_shared_status_of_a_mixed_selection(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion()
    make_cached_suggestion(status=CVEDerivationClusterProposal.Status.ACCEPTED)
    assert shared_state(anonymous_client)["status"] is None


def test_shared_issue_draft_membership(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion(
            status=CVEDerivationClusterProposal.Status.ACCEPTED,
            in_issue_draft=True,
        )
    assert shared_state(anonymous_client)["in_issue_draft"] is True


def test_shared_issue_draft_membership_of_a_mixed_selection(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    make_cached_suggestion(status=CVEDerivationClusterProposal.Status.ACCEPTED)
    assert shared_state(anonymous_client)["in_issue_draft"] is None


def test_shared_comment(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion(comment="foo")
    assert shared_state(anonymous_client)["comment"] == "foo"


def test_shared_absence_of_comment(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion()
    assert shared_state(anonymous_client)["comment"] == ""


def test_comment_of_a_selection_saying_different_things(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion(comment="foo")
    make_cached_suggestion(comment="bar")
    assert shared_state(anonymous_client)["comment"] is None


def test_comment_of_a_selection_only_partly_commented(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion(comment="foo")
    make_cached_suggestion()
    assert shared_state(anonymous_client)["comment"] is None


def test_shared_active_package(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion()
    assert shared_state(anonymous_client)["packages"] == [
        {"state": "active", "attribute": drv.attribute}
    ]


def test_shared_ignored_package(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion().ignore_package(drv.attribute)
    assert shared_state(anonymous_client)["packages"] == [
        {"state": "ignored", "attribute": drv.attribute}
    ]


def test_package_in_different_states_is_not_shared(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion()
    make_cached_suggestion().ignore_package(drv.attribute)
    assert shared_state(anonymous_client)["packages"] == []


def test_package_missing_from_a_suggestion_is_not_shared(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion()
    make_cached_suggestion(
        drvs={make_drv(pname="other"): ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    assert shared_state(anonymous_client)["packages"] == []


def test_shared_active_maintainer(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion()
    maintainers = shared_state(anonymous_client)["maintainers"]
    assert [m["state"] for m in maintainers] == ["active"]
    assert maintainers[0]["maintainer"]["github_id"] == maintainer.github_id


def test_shared_ignored_maintainer(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion().ignore_maintainer(maintainer.github_id)
    maintainers = shared_state(anonymous_client)["maintainers"]
    assert [m["state"] for m in maintainers] == ["ignored"]
    assert maintainers[0]["maintainer"]["github_id"] == maintainer.github_id


def test_maintainer_in_different_states_is_not_shared(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion()
    make_cached_suggestion().ignore_maintainer(maintainer.github_id)
    assert shared_state(anonymous_client)["maintainers"] == []


@pytest.fixture
def container_with_reference(
    make_container: Callable[..., Container],
) -> Container:
    return make_container(references=[(REFERENCE_NAME, REFERENCE_URL, [])])


def test_shared_active_reference(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    container_with_reference: Container,
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion(container=container_with_reference)
    references = shared_state(anonymous_client)["references"]
    assert [r["state"] for r in references] == ["active"]
    assert references[0]["reference"]["url"] == REFERENCE_URL


def test_shared_ignored_reference(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    container_with_reference: Container,
    anonymous_client: APIClient,
) -> None:
    for _ in range(2):
        make_cached_suggestion(container=container_with_reference).ignore_reference(
            REFERENCE_URL
        )
    references = shared_state(anonymous_client)["references"]
    assert [r["state"] for r in references] == ["ignored"]
    assert references[0]["reference"]["url"] == REFERENCE_URL


def test_reference_in_different_states_is_not_shared(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    container_with_reference: Container,
    anonymous_client: APIClient,
) -> None:
    make_cached_suggestion(container=container_with_reference)
    make_cached_suggestion(container=container_with_reference).ignore_reference(
        REFERENCE_URL
    )
    assert shared_state(anonymous_client)["references"] == []


def test_a_shared_reference_is_identified_by_its_url_alone(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
    anonymous_client: APIClient,
) -> None:
    """
    The same URL named differently across the selection is still shared.

    Names and tags are merged like the references of a single suggestion: the name is
    kept only if the suggestions agree on it, and tags are combined.
    """
    for index, (name, tags) in enumerate(
        [(REFERENCE_NAME, ["patch"]), ("Other name", ["vendor-advisory"])]
    ):
        make_cached_suggestion(
            container=make_container(
                cve_id=f"CVE-2025-100{index}",
                references=[(name, REFERENCE_URL, tags)],
            )
        )
    references = shared_state(anonymous_client)["references"]
    assert [(r["state"], r["reference"]["url"]) for r in references] == [
        ("active", REFERENCE_URL)
    ]
    assert references[0]["reference"]["name"] == ""
    assert references[0]["reference"]["tags"] == ["patch", "vendor-advisory"]


def test_a_shared_reference_keeps_the_name_the_suggestions_agree_on(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
    anonymous_client: APIClient,
) -> None:
    for index, name in enumerate([REFERENCE_NAME, "", REFERENCE_NAME]):
        make_cached_suggestion(
            container=make_container(
                cve_id=f"CVE-2025-100{index}",
                references=[(name, REFERENCE_URL, [])],
            )
        )
    references = shared_state(anonymous_client)["references"]
    assert references[0]["reference"]["name"] == REFERENCE_NAME


def test_a_shared_package_is_accepted_by_the_bulk_operation(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
    staff_client: APIClient,
) -> None:
    suggestions = [make_cached_suggestion() for _ in range(2)]
    packages = shared_state(staff_client, "status=pending")["packages"]
    assert packages == [{"state": "active", "attribute": drv.attribute}]

    response = staff_client.patch(
        f"{PACKAGES_URL}?status=pending",
        {"package_attribute": packages[0]["attribute"], "ignored": True},
        format="json",
    )
    assert response.status_code == 200
    assert response.data == {"affected": len(suggestions)}
