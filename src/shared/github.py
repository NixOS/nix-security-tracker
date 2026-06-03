import logging
from urllib.parse import quote

from django.conf import settings
from django.template.defaultfilters import truncatewords
from github import Auth, Github
from github.Issue import Issue as GithubIssue

from shared.models.cached import CachedSuggestions
from shared.models.linkage import CVEDerivationClusterProposal
from webview.templatetags.viewutils import severity_badge

logger = logging.getLogger(__name__)


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

    def cvss_details(suggestion: CVEDerivationClusterProposal) -> str:
        badge = severity_badge(suggestion.cached.payload["metrics"])
        if badge:
            metric = badge["cvss"]
            metrics = "\n".join(
                [f"- {k}: {v}" for k, v in badge["human_readable"].items()]
            )
            score_label = (
                f"<strong>{metric['base_score']:.1f} {metric['base_severity']}</strong>"
            )
            return f"""
<details>
<summary>{score_label} | {metric["vector_string"]}</summary>

- CVSS version (CVSS): {metric["version"]}
{metrics}
</details>"""
        else:
            return ""

    def maintainers(suggestion: CVEDerivationClusterProposal) -> str:
        raw = suggestion.cached.payload["categorized_maintainers"]
        # We need to query for the latest username of each maintainer, because
        # those might have changed since they were written out in Nixpkgs; since
        # we have the user id (which is stable), we can ask the GitHub API
        maintainers_list = [
            get_maintainer_username(maintainer, github)
            for maintainer in (raw["active"] + raw["added"])
            if "github_id" in maintainer and "github" in maintainer
        ]
        if maintainers_list:
            maintainers_joined = ", ".join(mention(m) for m in maintainers_list)
            return f"Affected package maintainers: cc {maintainers_joined}\n"
        else:
            return ""

    def affected_nix_packages(suggestion: CVEDerivationClusterProposal) -> str:
        packages = []
        for attribute_name, pkg in suggestion.cached.payload["packages"].items():
            pull_requests = f"https://github.com/NixOS/nixpkgs/pulls?q=sort%3Aupdated-desc+is%3Apr+{quote(attribute_name)}+in%3Atitle+-%3E+in%3Atitle"
            versions = []
            for major_channel, version_data in pkg["channels"].items():
                if version_data["major_version"]:
                    versions.append(
                        f"  - {version_data['major_version']}@{major_channel}"
                    )
            package = f"- `{attribute_name}` ([pull requests]({pull_requests}))"
            if versions:
                package += f"\n{'\n'.join(versions)}"
            packages.append(package)
        return f"""
### Affected packages

{"\n".join(packages)}"""

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
        return f"""## [{cve_id}](https://nvd.nist.gov/vuln/detail/{quote(cve_id)})

{cvss_details(suggestion)}

<details><summary><strong>{suggestion_title}</strong></summary>
{suggestion.cached.payload["description"]}
</details>

{references(suggestion)}
{affected_nix_packages(suggestion)}
{maintainers(suggestion)}{suggestion_comment(suggestion)}"""

    def help_text() -> str:
        return """
# Next steps

- Start here if this is your first security issue: [Triaging and fixing security issues](https://github.com/NixOS/nixpkgs/blob/master/pkgs/README.md#triaging-and-fixing)
- Backports are usually needed: [Backporting security fixes](https://github.com/NixOS/nixpkgs/blob/master/CONTRIBUTING.md#how-to-backport-pull-requests)
"""

    repo = github.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")

    sections = "\n\n".join(suggestion_section(cs.proposal) for cs in cached_suggestions)

    body = f"""\
[Nixpkgs security tracker issue]({tracker_issue_uri})

{sections}
{help_text()}"""

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
