from collections.abc import Callable, Iterator
from io import StringIO
from unittest import mock

import pytest
from django.core.management import call_command

from shared.channels import SuggestionRefreshChannel
from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal


@pytest.fixture
def mock_notify() -> Iterator[mock.MagicMock]:
    with mock.patch(
        "shared.management.commands.rematch_stale_suggestions.pgpubsub.notify"
    ) as mocked:
        yield mocked


def test_no_stale_suggestions(db: None, mock_notify: mock.MagicMock) -> None:
    """Nothing to do when there are no PENDING/ACCEPTED suggestions on an outdated algorithm_version."""
    out = StringIO()
    call_command("rematch_stale_suggestions", stdout=out)

    assert "no stale suggestions; nothing to do.\n" == out.getvalue().lower()
    mock_notify.assert_not_called()


def test_dispatches_stale_suggestion(
    cve: Container,
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    mock_notify: mock.MagicMock,
) -> None:
    """A suggestion on an outdated algorithm_version is dispatched for rematch."""
    # pending stale version
    pending_suggestion = make_suggestion(container=cve, algorithm_version=0)
    # acceped stale version
    accepted_suggestion = make_suggestion(
        container=cve,
        algorithm_version=0,
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )
    # rejected suggestion
    make_suggestion(
        container=cve,
        algorithm_version=0,
        status=CVEDerivationClusterProposal.Status.REJECTED,
    )

    # published suggestion
    make_suggestion(
        container=cve,
        algorithm_version=0,
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    # suggestion on curreny version
    make_suggestion(container=cve)

    out = StringIO()
    call_command("rematch_stale_suggestions", stdout=out)

    expected_calls = [
        mock.call(SuggestionRefreshChannel, pk=pending_suggestion.pk),
        mock.call(SuggestionRefreshChannel, pk=accepted_suggestion.pk),
    ]
    mock_notify.assert_has_calls(expected_calls, any_order=True)
    assert mock_notify.call_count == 2
