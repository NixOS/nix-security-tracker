from collections.abc import Callable

from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.listeners.automatic_linkage import refresh_suggestion_derivation_links
from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixEvaluation


def test_detail_activity_log_null_by_default(
    cached_suggestion: CVEDerivationClusterProposal,
    client: APIClient,
) -> None:
    response = client.get(
        reverse(
            "cvederivationclusterproposal-detail", kwargs={"pk": cached_suggestion.pk}
        )
    )
    assert response.status_code == 200
    assert response.data["activity_log"] is None


def test_detail_activity_log_inlined_when_requested(
    cached_suggestion: CVEDerivationClusterProposal,
    client: APIClient,
) -> None:
    response = client.get(
        reverse(
            "cvederivationclusterproposal-detail", kwargs={"pk": cached_suggestion.pk}
        ),
        {"activity_log": "true"},
    )
    assert response.status_code == 200
    activity_log = response.data["activity_log"]
    assert isinstance(activity_log, list)
    assert len(activity_log) >= 1
    entry = activity_log[0]
    assert set(entry.keys()) >= {"action", "timestamp"}
    assert any(e["action"] == "create" for e in activity_log)


def test_list_activity_log_null_by_default(
    cached_suggestion: CVEDerivationClusterProposal,
    client: APIClient,
) -> None:
    response = client.get(reverse("cvederivationclusterproposal-list"))
    assert response.status_code == 200
    assert response.data["results"][0]["activity_log"] is None


def test_list_activity_log_inlined_when_requested(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    client: APIClient,
) -> None:
    make_cached_suggestion()
    make_cached_suggestion()
    response = client.get(
        reverse("cvederivationclusterproposal-list"), {"activity_log": "true"}
    )
    assert response.status_code == 200
    for result in response.data["results"]:
        assert isinstance(result["activity_log"], list)
        assert len(result["activity_log"]) >= 1


def test_issue_expanded_suggestions_inline_activity_log(
    issue: NixpkgsIssue,
    client: APIClient,
) -> None:
    # Without the param, expanded suggestions carry a null activity log.
    response = client.get(
        reverse("nixpkgsissue-detail", kwargs={"code": issue.code}),
        {"expand": "suggestions"},
    )
    assert response.status_code == 200
    assert response.data["suggestions"][0]["activity_log"] is None

    # With the param, they carry the folded activity log.
    response = client.get(
        reverse("nixpkgsissue-detail", kwargs={"code": issue.code}),
        {"expand": "suggestions", "activity_log": "true"},
    )
    assert response.status_code == 200
    activity_log = response.data["suggestions"][0]["activity_log"]
    assert isinstance(activity_log, list)
    assert len(activity_log) >= 1


def test_issue_list_expanded_suggestions_inline_activity_log(
    issue: NixpkgsIssue,
    client: APIClient,
) -> None:
    response = client.get(
        reverse("nixpkgsissue-list"),
        {"expand": "suggestions", "activity_log": "true"},
    )
    assert response.status_code == 200
    suggestions = response.data["results"][0]["suggestions"]
    assert isinstance(suggestions[0]["activity_log"], list)
    assert len(suggestions[0]["activity_log"]) >= 1


def test_rematch_appears_in_activity_log(
    cached_suggestion: CVEDerivationClusterProposal,
    client: APIClient,
) -> None:
    """
    A rematch call must be visible in the activity log so API consumers
    can track algorithm reruns without reading server logs.
    """
    refresh_suggestion_derivation_links(cached_suggestion)
    response = client.get(
        reverse(
            "cvederivationclusterproposal-detail",
            kwargs={"pk": cached_suggestion.pk},
        ),
        {"activity_log": "true"},
    )
    assert response.status_code == 200
    rematch = next(e for e in response.data["activity_log"] if e["action"] == "rematch")
    assert rematch["username"] is None


def test_rematch_dismissal_is_not_attributed_to_anyone(
    cached_suggestion: CVEDerivationClusterProposal,
    make_evaluation: Callable[..., NixEvaluation],
    client: APIClient,
) -> None:
    make_evaluation()
    refresh_suggestion_derivation_links(cached_suggestion)
    response = client.get(
        reverse(
            "cvederivationclusterproposal-detail",
            kwargs={"pk": cached_suggestion.pk},
        ),
        {"activity_log": "true"},
    )
    assert response.status_code == 200
    dismissal = next(
        e
        for e in response.data["activity_log"]
        if e["action"] == "update"
        and e["status_value"] == CVEDerivationClusterProposal.Status.REJECTED
    )
    assert dismissal["username"] is None
