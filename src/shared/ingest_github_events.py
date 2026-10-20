"""
Record what happened on GitHub to the issues we published.
"""

import logging
import time
from itertools import batched, groupby

import github_graphql as schema
from github import Github, GithubException
from sgqlc.operation import Operation

from shared.github_events import Repository
from shared.models.issue import EventType, GitHubItem, GitHubSyncError

logger = logging.getLogger(__name__)

# Large enough to save requests, small enough to stay clear of GitHub's query timeouts.
BATCH_SIZE = 200


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
    repositories = items.order_by().values("owner", "repository").distinct().count()
    logger.info(
        f"Syncing {items.count()} published GitHub issues in {repositories} repositories..."
    )
    synced = 0
    failed = 0
    start = time.monotonic()

    # NOTE(@fricklerhandwerk): While we currently don't support multiple source repositories,
    # item numbering is scoped per repository and thus it makes sense to arrange the query accordingly.
    for (owner, name), group in groupby(
        items, key=lambda item: (item.owner, item.repository)
    ):
        by_number = {item.number: item for item in group}
        logger.info(
            f"{owner}/{name}: Syncing GitHub events for {len(by_number)} issues..."
        )
        for batch in batched(by_number, BATCH_SIZE):
            operation = Operation(schema.github.query_type)
            operation.repository(owner=owner, name=name).__fragment__(
                Repository.fragment(batch)
            )
            batch_start = time.monotonic()
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
            fetched = time.monotonic()
            data = operation + response
            found = []
            events = 0
            for issue in Repository(data.repository).issues(batch):
                issue_events = list(issue.events())
                logger.debug(
                    f"{owner}/{name}#{issue.number}: "
                    + (
                        ", ".join(
                            f"{EventType(event.event_type).name} at {event.occurred_at.isoformat()}"
                            for event in issue_events
                        )
                        or "no events"
                    )
                )
                by_number[issue.number].add_events(issue_events)
                events += len(issue_events)
                found.append(by_number[issue.number])
            GitHubSyncError.objects.filter(item__in=found).delete()
            logger.info(
                f"{owner}/{name}: {len(found)} of {len(batch)} issues synced, {len(batch) - len(found)} failed, {events} events fetched"
                f" (fetch {fetched - batch_start:.1f}s, record {time.monotonic() - fetched:.1f}s)"
            )
            synced += len(found)
            failed += len(batch) - len(found)
    logger.info(
        f"Synced {synced} issues, {failed} failed, in {time.monotonic() - start:.1f}s"
    )
