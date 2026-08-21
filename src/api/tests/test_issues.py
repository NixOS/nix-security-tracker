from collections.abc import Callable
from datetime import timedelta

from django.utils import timezone
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.cve import Container
from shared.models.issue import EventType, NixpkgsEvent, NixpkgsIssue


def list_url() -> str:
    return reverse("nixpkgsissue-list")


def detail_url(code: str) -> str:
    return reverse("nixpkgsissue-detail", kwargs={"code": code})


def test_list_issues_anonymous(
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    """Anonymous users can list issues."""
    client = APIClient()
    make_issue()
    response = client.get(list_url())
    assert response.status_code == 200


def test_list_issues_paginated_shape(
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    """The response is paginated and `suggestions` defaults to a list of ids."""
    client = APIClient()
    issue = make_issue()
    response = client.get(list_url())
    assert response.status_code == 200
    assert set(response.data.keys()) == {"count", "next", "previous", "results"}
    assert response.data["count"] == 1
    result = response.data["results"][0]
    assert result["id"] == issue.pk
    assert result["code"] == issue.code
    assert result["title"] == issue.title
    assert result["status"] == issue.status
    assert result["github_issue_url"] is None
    assert result["suggestions"] == [s.pk for s in issue.suggestions.all()]


def test_list_issues_expand_suggestions(
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    """`?expand=suggestions` returns full suggestion objects instead of ids."""
    client = APIClient()
    issue = make_issue()
    suggestion = issue.suggestions.get()

    response = client.get(list_url(), {"expand": "suggestions"})
    assert response.status_code == 200
    suggestions = response.data["results"][0]["suggestions"]
    assert len(suggestions) == 1
    assert suggestions[0]["id"] == suggestion.pk
    assert suggestions[0]["cve_id"] == suggestion.cve.cve_id


def test_list_issues_orders_by_most_recently_created_first(
    make_container: Callable[..., Container],
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    """Issues are sorted by most recently created first."""
    client = APIClient()
    older = make_issue(container=make_container(cve_id="CVE-2025-1111"))
    newer = make_issue(container=make_container(cve_id="CVE-2025-2222"))

    now = timezone.now()
    NixpkgsIssue.objects.filter(pk=older.pk).update(created_at=now - timedelta(days=2))
    NixpkgsIssue.objects.filter(pk=newer.pk).update(created_at=now - timedelta(days=1))

    response = client.get(list_url())
    assert response.status_code == 200
    codes = [item["code"] for item in response.data["results"]]
    assert codes == [newer.code, older.code]


def test_issue_detail_by_code(
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    """The detail endpoint is looked up by issue code and defaults to ids-only suggestions."""
    client = APIClient()
    issue = make_issue()

    response = client.get(detail_url(issue.code))
    assert response.status_code == 200
    assert response.data["code"] == issue.code
    assert response.data["suggestions"] == [s.pk for s in issue.suggestions.all()]


def test_issue_detail_expand_suggestions(
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    """`?expand=suggestions` on the detail endpoint returns full suggestion objects."""
    client = APIClient()
    issue = make_issue()
    suggestion = issue.suggestions.get()

    response = client.get(detail_url(issue.code), {"expand": "suggestions"})
    assert response.status_code == 200
    suggestions = response.data["suggestions"]
    assert len(suggestions) == 1
    assert suggestions[0]["id"] == suggestion.pk
    assert suggestions[0]["cve_id"] == suggestion.cve.cve_id


def test_issue_detail_github_issue_url(
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    client = APIClient()
    issue = make_issue()
    NixpkgsEvent.objects.create(
        issue=issue,
        event_type=EventType.ISSUE | EventType.OPENED,
        url="https://github.com/NixOS/nixpkgs/issues/1",
    )

    response = client.get(detail_url(issue.code))
    assert response.status_code == 200
    assert (
        response.data["github_issue_url"] == "https://github.com/NixOS/nixpkgs/issues/1"
    )


def test_issue_detail_not_found(db: None) -> None:
    client = APIClient()
    response = client.get(detail_url("NIXPKGS-2099-9999"))
    assert response.status_code == 404
    assert "detail" in response.data


def test_issue_detail_only_lists_its_own_suggestions(
    make_container: Callable[..., Container],
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    client = APIClient()
    issue1 = make_issue(container=make_container(cve_id="CVE-2025-1111"))
    issue2 = make_issue(container=make_container(cve_id="CVE-2025-2222"))

    response = client.get(detail_url(issue1.code))
    assert response.status_code == 200
    ids = response.data["suggestions"]
    assert ids == [s.pk for s in issue1.suggestions.all()]
    assert not set(ids) & {s.pk for s in issue2.suggestions.all()}
