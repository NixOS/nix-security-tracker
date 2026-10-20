"""
Record what happened on GitHub to the issues we published.
"""

import logging
from itertools import batched, groupby

import github_graphql as schema
from github import Github, GithubException
from sgqlc.operation import Operation

from shared.github_events import Repository
from shared.models.issue import GitHubItem, GitHubSyncError

logger = logging.getLogger(__name__)

# Large enough to save requests, small enough to stay clear of GitHub's query timeouts.
BATCH_SIZE = 25


def sync_github_events(github: Github) -> None:
    """
    Fetch the history of every published issue from GitHub and record events not seen before.
    """
    items = (
        GitHubItem.objects.filter(
            kind=GitHubItem.Kind.ISSUE, nixpkgs_issues__isnull=False
        )
        .distinct()
        .order_by("owner", "repository", "number")
    )

    # NOTE(@fricklerhandwerk): While we currently don't support multiple source repositories,
    # item numbering is scoped per repository and thus it makes sense to arrange the query accordingly.
    for (owner, name), group in groupby(
        items, key=lambda item: (item.owner, item.repository)
    ):
        by_number = {item.number: item for item in group}
        for batch in batched(by_number, BATCH_SIZE):
            operation = Operation(schema.github.query_type)
            operation.repository(owner=owner, name=name).__fragment__(
                Repository.fragment(batch)
            )
            try:
                _, response = github.requester.graphql_query(str(operation), {})
            except GithubException as e:
                response = e.data
                by_alias = {Repository.alias(number): number for number in batch}
                for error in response.get("errors", []):
                    match error:
                        case {"type": "NOT_FOUND", "path": ["repository", alias]} if (
                            alias in by_alias
                        ):
                            logger.warning(
                                f"Skipping {owner}/{name}#{by_alias[alias]}: {error['message']}"
                            )
                            GitHubSyncError.objects.update_or_create(
                                item=by_number[by_alias[alias]],
                                error_type=error["type"],
                                defaults={"message": error["message"]},
                            )
                        case _:
                            raise
            data = operation + response
            found = []
            for issue in Repository(data.repository).issues(batch):
                by_number[issue.number].add_events(issue.events())
                found.append(by_number[issue.number])
            GitHubSyncError.objects.filter(item__in=found).delete()
