from collections.abc import Callable

import pytest
from django.conf import settings

from shared import github as gh_module
from shared.cache_suggestions import cache_new_suggestions
from shared.github import GH_ISSUE_BODY_MAX_LENGTH, create_gh_issue
from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation, NixMaintainer
from shared.tests.test_github_sync import MockGithub


@pytest.mark.django_db
def test_body_within_limit_keeps_full_content(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    tracker_issue_uri = "https://tracker.example.org/issue/123"

    mock_gh = MockGithub()
    create_gh_issue(
        [suggestion.cached],
        "Test issue title",
        tracker_issue_uri,
        github=mock_gh,  # type: ignore
    )

    repo = mock_gh.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")
    body = repo.created_issues[0]["body"]

    assert "Affected packages" in body
    assert "Affected package maintainers" in body
    assert "too large" not in body


@pytest.mark.django_db
def test_full_body_dedupes_packages_and_maintainers_across_cves(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
) -> None:
    """
    Two CVEs affecting the same package/maintainer must produce a single "Affected packages" entry and a single "Affected package maintainers" line for the whole issue.
    """
    container_a = make_container(cve_id="CVE-2025-0001", package_name="shared-pkg")
    container_b = make_container(cve_id="CVE-2025-0002", package_name="shared-pkg")

    drv = make_drv(pname="shared-pkg", attribute="shared-pkg")

    suggestion_a = make_suggestion(
        container=container_a,
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )
    suggestion_b = make_suggestion(
        container=container_b,
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )
    cache_new_suggestions(suggestion_a)
    cache_new_suggestions(suggestion_b)

    tracker_issue_uri = "https://tracker.example.org/issue/123"

    mock_gh = MockGithub()
    create_gh_issue(
        [suggestion_a.cached, suggestion_b.cached],
        "Test issue title",
        tracker_issue_uri,
        github=mock_gh,  # type: ignore
    )

    repo = mock_gh.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")
    body = repo.created_issues[0]["body"]

    assert body.count("Affected packages") == 1
    assert body.count("`shared-pkg`") == 1
    assert body.count("Affected package maintainers") == 1
    assert body.count(maintainer.github) == 1


@pytest.mark.django_db
def test_body_over_limit_uses_compact_cve_bullet_list(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    huge_description = "x" * (GH_ISSUE_BODY_MAX_LENGTH + 1000)

    container_a = make_container(cve_id="CVE-2025-0001", description=huge_description)
    container_b = make_container(cve_id="CVE-2025-0002", description=huge_description)

    suggestion_a = make_suggestion(
        container=container_a, status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    suggestion_b = make_suggestion(
        container=container_b, status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    cache_new_suggestions(suggestion_a)
    cache_new_suggestions(suggestion_b)

    tracker_issue_uri = "https://tracker.example.org/issue/123"

    mock_gh = MockGithub()
    create_gh_issue(
        [suggestion_a.cached, suggestion_b.cached],
        "Test issue title",
        tracker_issue_uri,
        github=mock_gh,  # type: ignore
    )

    repo = mock_gh.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")
    body = repo.created_issues[0]["body"]

    assert len(body) <= GH_ISSUE_BODY_MAX_LENGTH
    assert tracker_issue_uri in body
    assert "too large" in body
    # Full descriptions are dropped, but the compact bullet list still names each CVE.
    assert "[CVE-2025-0001](" in body
    assert "[CVE-2025-0002](" in body
    assert "([NVD](https://nvd.nist.gov/vuln/detail/CVE-2025-0001))" in body
    assert huge_description not in body
    assert "Affected packages" in body
    # Both suggestions share the same default maintainer, so the mention must be grouped and appear only once.
    assert body.count("Affected package maintainers") == 1


@pytest.mark.django_db
def test_compaction_cascade_drops_sections_progressively(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    container_a = make_container(cve_id="CVE-2025-0001", package_name="pkg-a")
    container_b = make_container(cve_id="CVE-2025-0002", package_name="pkg-b")

    drv_a = make_drv(pname="pkg-a", attribute="pkg-a")
    drv_b = make_drv(pname="pkg-b", attribute="pkg-b")

    suggestion_a = make_suggestion(
        container=container_a,
        drvs={drv_a: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )
    suggestion_b = make_suggestion(
        container=container_b,
        drvs={drv_b: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )
    cache_new_suggestions(suggestion_a)
    cache_new_suggestions(suggestion_b)

    tracker_issue_uri = "https://tracker.example.org/issue/123"
    cached_suggestions = [suggestion_a.cached, suggestion_b.cached]

    def body_at(max_length: int) -> str:
        monkeypatch.setattr(gh_module, "GH_ISSUE_BODY_MAX_LENGTH", max_length)
        mock_gh = MockGithub()
        create_gh_issue(
            cached_suggestions,
            "Test issue title",
            tracker_issue_uri,
            github=mock_gh,  # type: ignore
        )
        repo = mock_gh.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")
        return repo.created_issues[0]["body"]

    # FIXME(@florentc): This uses hardcoded target size limits to trigger the various compact modes.
    # If issue generation is modified, those will have to change as well.

    # Level 0: everything fits.
    full_body = body_at(10**6)
    assert tracker_issue_uri in full_body
    assert "## [CVE-2025-0001](" in full_body
    assert "Affected packages" in full_body
    assert "Affected package maintainers" in full_body
    assert "too large" not in full_body

    # Level 1: full per-CVE sections replaced by the compact bullet list;
    # packages and maintainers are kept.
    # Only the compact bullet list embeds `suggestion.pk` (via
    # `suggestion_link()`), so it's the only level whose budget depends on
    # pk digit width; that width isn't reset between test functions since
    # Postgres sequences persist across transactions. Base budget 1200 was
    # calibrated against a measured 1172-char body with pk digits 1 and 2
    # (2 digits total); adjust for however many digits the actual pks have.
    pk_digits_total = len(str(suggestion_a.pk)) + len(str(suggestion_b.pk))
    level1_budget = 1200 + (pk_digits_total - 2)
    compact_body = body_at(level1_budget)
    assert tracker_issue_uri in compact_body
    assert "too large" in compact_body
    assert "## [CVE-2025-0001](" not in compact_body
    assert "[CVE-2025-0001](" in compact_body
    assert "Affected packages" in compact_body
    assert "Affected package maintainers" in compact_body

    # Level 2: the compact bullet list is dropped too; packages and
    # maintainers remain. Doesn't reference `suggestion.pk`, so this
    # budget is static.
    no_list_body = body_at(1000)
    assert tracker_issue_uri in no_list_body
    assert "too large" in no_list_body
    assert "CVE-2025-0001" not in no_list_body
    assert "Affected packages" in no_list_body
    assert "Affected package maintainers" in no_list_body

    # Level 3: the packages section is dropped too; maintainers remain.
    no_packages_body = body_at(700)
    assert tracker_issue_uri in no_packages_body
    assert "too large" in no_packages_body
    assert "Affected packages" not in no_packages_body
    assert "Affected package maintainers" in no_packages_body

    # Level 4: maintainers are dropped too, in the worst case.
    minimal_body = body_at(500)
    assert tracker_issue_uri in minimal_body
    assert "too large" in minimal_body
    assert "Affected packages" not in minimal_body
    assert "Affected package maintainers" not in minimal_body
    assert "Maintainer mentions omitted." in minimal_body
