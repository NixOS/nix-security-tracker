import logging
from urllib.parse import quote, urljoin

from django.conf import settings
from django.template.defaultfilters import truncatewords
from github import Auth, Github
from github.Issue import Issue as GithubIssue

from shared.cvss import CvssFields, compute_cvss_fields
from shared.models.cached import CachedSuggestions
from shared.models.cve import Metric
from shared.models.linkage import CVEDerivationClusterProposal

logger = logging.getLogger(__name__)

# GitHub's maximum length for an issue body, in Unicode codepoints.
# According to https://github.com/dead-claudia/github-limits
GH_ISSUE_BODY_MAX_LENGTH = 65536


def _level0_body(
    tracker_link: str,
    full_sections: str,
    packages_section: str,
    maintainers: str,
    help_text: str,
) -> str:
    return f"""\
{tracker_link}

{full_sections}
{packages_section}
{maintainers}
{help_text}"""


def _level1_body(
    tracker_link: str,
    size_note: str,
    compact_list: str,
    packages_section: str,
    maintainers: str,
    help_text: str,
) -> str:
    return f"""\
{tracker_link}

{size_note}

{compact_list}
{packages_section}
{maintainers}
{help_text}"""


def _level2_body(
    tracker_link: str,
    size_note: str,
    packages_section: str,
    maintainers: str,
    help_text: str,
) -> str:
    return f"""\
{tracker_link}

{size_note}

{packages_section}
{maintainers}
{help_text}"""


def _level3_body(
    tracker_link: str,
    size_note: str,
    maintainers: str,
    help_text: str,
) -> str:
    return f"""\
{tracker_link}

{size_note}

{maintainers}
{help_text}"""


def _level4_body(
    tracker_link: str,
    size_note: str,
    help_text: str,
) -> str:
    return f"""\
{tracker_link}

{size_note}

Maintainer mentions omitted.

{help_text}"""


def get_gh(per_page: int = 30) -> Github:
    """
    Initialize a GitHub API connection
    """

    gh_auth = Auth.AppAuth(
        settings.GH_CLIENT_ID, settings.GH_APP_PRIVATE_KEY
    ).get_installation_auth(settings.GH_APP_INSTALLATION_ID)

    return Github(auth=gh_auth, per_page=per_page)


def create_gh_issue(
    cached_suggestions: list[CachedSuggestions],
    title: str,
    tracker_issue_uri: str,
    # FIXME(@fricklerhandwerk): [tag:todo-github-connection] Make an application-level "GitHub connection" object instead.
    # Instantiating the connection at definition time makes mocking it away for tests rather cumbersome.
    # Ideally we'd have a generic mock that would abstract away regular book keeping such as app authentication, and tests would override only relevant behavior.
    github: Github = get_gh(),
) -> GithubIssue:
    """
    Creates a GitHub issue for the given suggestions on the Nixpkgs repository,
    given a link to the corresponding NixpkgsIssue on the tracker side.

    The tracker issue URI could be derived automatically from NixpkgsIssue here,
    but it's more annoying to build without a request object at hand, so we
    leave it to the caller.
    """

    def mention(maintainer: str) -> str:
        """
        Convert a maintainer to a GitHub mention with a leading `@`. If the
        setting GH_ISSUES_PING_MAINTAINERS is set to False, this mention is
        escaped with backticks to prevent actually pinging the maintainers.
        """
        if settings.GH_ISSUES_PING_MAINTAINERS:
            return f"@{maintainer}"
        else:
            return f"`@{maintainer}`"

    def first_cvss_metric(
        suggestion: CVEDerivationClusterProposal,
    ) -> tuple[dict, CvssFields] | tuple[None, None]:
        for metric in suggestion.cached.payload["metrics"]:
            fields = compute_cvss_fields(metric)
            if fields.base_score is not None:
                return metric, fields
        return None, None

    def severity_label(suggestion: CVEDerivationClusterProposal) -> str:
        """
        Short bold "<score> <SEVERITY>" label, or a fallback when no CVSS
        metric could be parsed. Shared between the full CVSS details block
        and the compact CVE bullet.
        """
        _, fields = first_cvss_metric(suggestion)
        if fields:
            return f"<strong>{fields.base_score:.1f} {fields.base_severity}</strong>"
        else:
            return "(no CVSS data)"

    def cvss_details(suggestion: CVEDerivationClusterProposal) -> str:
        metric, fields = first_cvss_metric(suggestion)
        if metric and fields:
            metrics = "\n".join(
                f"- {hr['label']}: {hr['value']}"
                for hr in (fields.human_readable or [])
            )
            version = Metric.Format(metric["format"]).label
            return f"""
<details>
<summary>{severity_label(suggestion)} | {metric["vector_string"]}</summary>

- CVSS version (CVSS): {version}
{metrics}
</details>"""
        else:
            return ""

    def suggestion_link(suggestion: CVEDerivationClusterProposal) -> str:
        """
        Link to the suggestion's own detail page in the frontend.
        """
        return urljoin(str(settings.BASE_URL), f"/suggestions/by-id/{suggestion.pk}")

    def nvd_link(cve_id: str) -> str:
        return f"https://nvd.nist.gov/vuln/detail/{quote(cve_id)}"

    def cve_title_links(suggestion: CVEDerivationClusterProposal) -> str:
        """
        CVE ID linking to the suggestion's tracker detail page, with the NVD
        record as a secondary parenthesized link. Used both in the full
        per-CVE section header and the compact CVE bullet.
        """
        cve_id = suggestion.cached.payload["cve_id"]
        return f"[{cve_id}]({suggestion_link(suggestion)}) ([NVD]({nvd_link(cve_id)}))"

    def cve_bullet(suggestion: CVEDerivationClusterProposal) -> str:
        return f"- {severity_label(suggestion)} {cve_title_links(suggestion)}"

    def maintainer_usernames(suggestion: CVEDerivationClusterProposal) -> list[str]:
        """
        Resolve the current GitHub usernames of the maintainers of the packages
        affected by a single suggestion.
        """
        raw = suggestion.cached.payload["categorized_maintainers"]
        # Orphan maintainers no longer maintain any active package, don't ping them.
        orphan_github_ids = {m["github_id"] for m in raw.get("orphan", [])}
        # We need to query for the latest username of each maintainer, because
        # those might have changed since they were written out in Nixpkgs; since
        # we have the user id (which is stable), we can ask the GitHub API
        return [
            get_maintainer_username(maintainer, github)
            for maintainer in (raw["active"] + raw["added"])
            if "github_id" in maintainer
            and "github" in maintainer
            and maintainer["github_id"] not in orphan_github_ids
        ]

    def maintainers_line() -> str:
        """
        Build a single "Affected package maintainers" line grouping the
        deduplicated maintainers of every suggestion in the bundle.
        """
        deduped: set[str] = set()
        for cs in cached_suggestions:
            for username in maintainer_usernames(cs.proposal):
                deduped.add(username)
        if not deduped:
            return ""
        maintainers_joined = ", ".join(mention(m) for m in deduped)
        return f"""
## Affected package maintainers

{maintainers_joined}
"""

    def affected_packages_section() -> str:
        """
        Build a single "Affected packages" section deduplicated across every
        suggestion in the bundle. When the same package attribute is affected
        by several CVEs, its per-channel versions are merged as the union of
        distinct versions seen.
        """
        order: list[str] = []
        packages: dict[str, dict[str, list[str]]] = {}
        for cs in cached_suggestions:
            for attribute_name, pkg in cs.payload["packages"].items():
                if attribute_name not in packages:
                    packages[attribute_name] = {}
                    order.append(attribute_name)
                for branch, package in pkg["branches"].items():
                    if package["version"]:
                        versions = packages[attribute_name].setdefault(branch, [])
                        if package["version"] not in versions:
                            versions.append(package["version"])

        if not packages:
            return ""

        lines = []
        for attribute_name in order:
            pull_requests = f"https://github.com/NixOS/nixpkgs/pulls?q=sort%3Aupdated-desc+is%3Apr+{quote(attribute_name)}+in%3Atitle+-%3E+in%3Atitle"
            package = f"- `{attribute_name}` ([pull requests]({pull_requests}))"
            version_lines = [
                f"  - {version}@{branch}"
                for branch, versions in packages[attribute_name].items()
                for version in sorted(versions)
            ]
            if version_lines:
                package += f"\n{'\n'.join(version_lines)}"
            lines.append(package)

        return f"""
## Affected packages

{"\n".join(lines)}"""

    def references(suggestion: CVEDerivationClusterProposal) -> str:
        refs = suggestion.cached.payload.get("categorized_url_references", {})
        active_refs = refs.get("active", [])

        if not active_refs:
            return ""

        ref_lines = []
        for ref in active_refs:
            if ref.get("name") and ref["name"].strip():
                ref_lines.append(f"- [{ref['name']}]({ref['url']})")
            else:
                ref_lines.append(f"- {ref['url']}")

            if ref.get("tags"):
                tags_str = ", ".join(f"`{tag}`" for tag in ref["tags"])
                ref_lines[-1] += f" ({tags_str})"

        return f"""

### References

{"\n".join(ref_lines)}"""

    def suggestion_comment(suggestion: CVEDerivationClusterProposal) -> str:
        comment = suggestion.comment
        if not comment:
            return ""
        max_backticks = 0
        current_backticks = 0
        for char in comment:
            if char == "`":
                current_backticks += 1
                max_backticks = max(max_backticks, current_backticks)
            else:
                current_backticks = 0
        # Use at least 3 backticks, or one more than the maximum found in
        # order to escape accidents or attempts at escaping the code block
        fence_backticks = "`" * max(3, max_backticks + 1)
        return f"""

### Additional comment

{fence_backticks}
{comment}
{fence_backticks}"""

    def suggestion_section(suggestion: CVEDerivationClusterProposal) -> str:
        cve_id = suggestion.cached.payload["cve_id"]
        suggestion_title = (
            suggestion.cached.payload.get("title")
            or truncatewords(suggestion.cached.payload.get("description", ""), 10)
            or cve_id
        )
        return f"""## {cve_title_links(suggestion)}

{cvss_details(suggestion)}

<details><summary><strong>{suggestion_title}</strong></summary>
{suggestion.cached.payload["description"]}
</details>

{references(suggestion)}
{suggestion_comment(suggestion)}"""

    def help_text() -> str:
        return """
# Next steps

- Start here if this is your first security issue: [Triaging and fixing security issues](https://github.com/NixOS/nixpkgs/blob/master/pkgs/README.md#triaging-and-fixing)
- Backports are usually needed: [Backporting security fixes](https://github.com/NixOS/nixpkgs/blob/master/CONTRIBUTING.md#how-to-backport-pull-requests)
"""

    repo = github.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")

    tracker_link = f"[Nixpkgs security tracker issue]({tracker_issue_uri})"
    packages_section = affected_packages_section()
    maintainers = maintainers_line()
    help_text_str = help_text()

    # Level 0: full per-CVE sections (title, CVSS, description, references,
    # comment), plus the single deduplicated packages/maintainers sections.
    full_sections = "\n\n".join(
        suggestion_section(cs.proposal) for cs in cached_suggestions
    )

    # Instead of building the full body text for each fallback level and
    # calling len() on that (large) concatenation, compute the length of
    # each independent chunk once, and compare a sum of those precomputed
    # lengths (plus each level's fixed template overhead: the literal
    # characters surrounding placeholders, including inter-block blank
    # lines/newlines) against the limit. The body text itself is only ever
    # built once, for the level that was actually selected.
    len_tracker_link = len(tracker_link)
    len_full_sections = len(full_sections)
    len_packages_section = len(packages_section)
    len_maintainers = len(maintainers)
    len_help_text = len(help_text_str)

    level0_overhead = len(_level0_body("", "", "", "", ""))
    level0_length = (
        level0_overhead
        + len_tracker_link
        + len_full_sections
        + len_packages_section
        + len_maintainers
        + len_help_text
    )

    if level0_length <= GH_ISSUE_BODY_MAX_LENGTH:
        body = _level0_body(
            tracker_link, full_sections, packages_section, maintainers, help_text_str
        )
    else:
        size_note = (
            "Note: this issue's content was too large to include CVE details directly. "
            "See the tracker link above for full information."
        )
        len_size_note = len(size_note)

        # Level 1: replace the full per-CVE sections with a compact bullet
        # list, one per CVE, keeping the packages/maintainers sections.
        compact_list = "\n".join(cve_bullet(cs.proposal) for cs in cached_suggestions)
        len_compact_list = len(compact_list)

        level1_overhead = len(_level1_body("", "", "", "", "", ""))
        level1_length = (
            level1_overhead
            + len_tracker_link
            + len_size_note
            + len_compact_list
            + len_packages_section
            + len_maintainers
            + len_help_text
        )

        if level1_length <= GH_ISSUE_BODY_MAX_LENGTH:
            body = _level1_body(
                tracker_link,
                size_note,
                compact_list,
                packages_section,
                maintainers,
                help_text_str,
            )
        else:
            # Level 2: drop the compact CVE bullet list entirely.
            level2_overhead = len(_level2_body("", "", "", "", ""))
            level2_length = (
                level2_overhead
                + len_tracker_link
                + len_size_note
                + len_packages_section
                + len_maintainers
                + len_help_text
            )

            if level2_length <= GH_ISSUE_BODY_MAX_LENGTH:
                body = _level2_body(
                    tracker_link,
                    size_note,
                    packages_section,
                    maintainers,
                    help_text_str,
                )
            else:
                # Level 3: also drop the affected packages section.
                level3_overhead = len(_level3_body("", "", "", ""))
                level3_length = (
                    level3_overhead
                    + len_tracker_link
                    + len_size_note
                    + len_maintainers
                    + len_help_text
                )

                if level3_length <= GH_ISSUE_BODY_MAX_LENGTH:
                    body = _level3_body(
                        tracker_link, size_note, maintainers, help_text_str
                    )
                else:
                    # Level 4: also drop the maintainers line, in the
                    # unlikely worst case where even that is still too large.
                    body = _level4_body(tracker_link, size_note, help_text_str)

    return repo.create_issue(title=title, body=body, labels=settings.GH_ISSUES_LABELS)


def get_maintainer_username(maintainer: dict, github: Github = get_gh()) -> str:
    """
    Get the current GitHub username of a maintainer given their user ID. If the
    request failed, fallback to the github handle stored in the maintainer
    object that comes from Nixpkgs, which might be out of date.
    # TODO: Cache the mapping, e.g. on initial sync and when receiving GitHub events
    # on username change, or simply when doing these calls for resolving the user ID.
    """
    try:
        return github.get_user_by_id(maintainer["github_id"]).login
    except Exception as e:
        logger.error(
            f"Couldn't retrieve the GitHub username for maintainer {maintainer['github_id']}, fallback to {maintainer['github']}: {e}"
        )
        return maintainer["github"]


def fetch_user_info(github_handle: str, github: Github = get_gh()) -> dict | None:
    """
    Fetch GitHub user info by handle.
    """
    try:
        user = github.get_user(github_handle)
        return {
            "id": user.id,
            "login": user.login,
            "name": user.name,
            "email": user.email,
        }
    except Exception:
        logger.error("Could not fetch GitHub user")
        return None
