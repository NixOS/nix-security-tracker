import logging
from urllib.parse import quote

from django.conf import settings
from django.template.defaultfilters import truncatewords
from github import Auth, Github
from github.Issue import Issue as GithubIssue

from shared.models import CachedSuggestions
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
    cached_suggestion: CachedSuggestions,
    tracker_issue_uri: str,
    comment: str | None = None,
    # FIXME(@fricklerhandwerk): [tag:todo-github-connection] Make an application-level "GitHub connection" object instead.
    # Instantiating the connection at definition time makes mocking it away for tests rather cumbersome.
    # Ideally we'd have a generic mock that would abstract away regular book keeping such as app authentication, and tests would override only relevant behavior.
    github: Github = get_gh(),
) -> GithubIssue:
    """
    Creates a GitHub issue for the given suggestion on the Nixpkgs repository,
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

    def cvss_details() -> str:
        metric = severity_badge(cached_suggestion.payload["metrics"])
        if metric:
            metrics = "\n".join([f"- {k}: {v}" for k, v in metric["metrics"].items()])
            return f"""
<details>
<summary>CVSS {metric["vectorString"]}</summary>

- CVSS version: {metric["version"]}
{metrics}
</details>"""
        else:
            return ""

    def maintainers() -> str:
        maintainers = cached_suggestion.payload["categorized_maintainers"]

        # We need to query for the latest username of each maintainer, because
        # those might have changed since they were written out in Nixpkgs; since
        # we have the user id (which is stable), we can ask the GitHub API
        maintainers_list = [
            get_maintainer_username(maintainer, github)
            for maintainer in (maintainers["active"] + maintainers["added"])
            if "github_id" in maintainer and "github" in maintainer
        ]

        if maintainers_list:
            maintainers_joined = ", ".join(mention(m) for m in maintainers_list)
            return f"- affected package maintainers: cc {maintainers_joined}\n"
        else:
            return ""

    def affected_nix_packages() -> str:
        packages = []

        for attribute_name, pkg in cached_suggestion.payload["packages"].items():
            versions = []
            for major_channel, version_data in pkg["channels"].items():
                if version_data["major_version"]:
                    versions.append(f"{version_data['major_version']}@{major_channel}")

            versions_details = f" ({', '.join(versions)})" if versions else ""
            packages.append(f"- `{attribute_name}`{versions_details}")

        return f"""
<details>
<summary>Affected packages</summary>

{"\n".join(packages)}
</details>"""

    def additional_comment() -> str:
        if comment:
            # Find the maximum number of consecutive backticks in the comment
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

## Additional comment

{fence_backticks}
{comment}
{fence_backticks}"""
        else:
            return ""

    repo = github.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")

    # NOTE(@fricklerhandwerk): [tag:title-fallback-hack] 3/4 of CVEs have no title, 1/2 have no description, but none has neither.
    # This hack, which we're also using in the template, can -- for now -- be expected to always work.
    # Users can still change the GitHub issue title on GitHub if the truncated description is not informative.
    if cached_suggestion.payload["title"]:
        title = cached_suggestion.payload["title"]
    elif cached_suggestion.payload["description"]:
        title = truncatewords(cached_suggestion.payload["description"], 10)
    else:
        # FIXME(@fricklerhandwerk): Do the input validation at the call site and either show a note to users that the title should be set on GitHub,
        # or offer a UI to override the title.
        title = "Security issue (missing title)"
        # XXX(@fricklerhandwerk): This should never happen, but we want to know when it does.
        logger.warning(
            "CVE container '%s' has no title and no description",
            cached_suggestion.payload["pk"],
        )

    body = f"""\
- [{cached_suggestion.payload["cve_id"]}](https://nvd.nist.gov/vuln/detail/{quote(cached_suggestion.payload["cve_id"])})
- [Nixpkgs security tracker issue]({tracker_issue_uri})
{maintainers()}
## Description

{cached_suggestion.payload["description"]}
{cvss_details()}
{affected_nix_packages()}{additional_comment()}"""

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
