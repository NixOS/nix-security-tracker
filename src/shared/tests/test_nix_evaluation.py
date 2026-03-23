import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from shared.listeners.nix_evaluation import evaluation_entrypoint
from shared.models.nix_evaluation import NixEvaluation


def _make_mock_process(*, returncode=None):
    proc = AsyncMock()
    proc.stdout = AsyncMock(spec=asyncio.StreamReader)
    proc.returncode = returncode
    proc.kill = MagicMock()
    proc.wait = AsyncMock(return_value=0)
    return proc


def _setup_mocks():
    """Build mocks for git repo, worktree, and log file."""
    repo = AsyncMock()
    worktree = MagicMock()
    worktree.path = "/tmp/fake-worktree"

    @asynccontextmanager
    async def fake_extract(*_a):
        yield worktree

    repo.extract_working_tree = fake_extract

    log_file = AsyncMock()
    log_file.fileno.return_value = 99

    @asynccontextmanager
    async def fake_open(*_a, **_kw):
        yield log_file

    mock_aiofiles = MagicMock()
    mock_aiofiles.open = fake_open

    return MagicMock(return_value=repo), mock_aiofiles


async def _fake_drain(_stdout):
    yield [b'{"attr":"foo","drvPath":"/nix/store/foo.drv"}']


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_subprocess_killed_on_ingestion_failure(make_evaluation, make_channel):
    channel = make_channel()
    evaluation = make_evaluation(
        channel=channel, state=NixEvaluation.EvaluationState.PENDING
    )
    proc = _make_mock_process(returncode=None)
    git_repo, aio = _setup_mocks()

    with (
        patch("shared.listeners.nix_evaluation.perform_evaluation", return_value=proc),
        patch("shared.listeners.nix_evaluation.drain_lines", side_effect=_fake_drain),
        patch(
            "shared.listeners.nix_evaluation.realtime_batch_process_attributes",
            side_effect=RuntimeError("db connection lost"),
        ),
        patch("shared.listeners.nix_evaluation.GitRepo", git_repo),
        patch("shared.listeners.nix_evaluation.aiofiles", aio),
    ):
        await evaluation_entrypoint(0.0, evaluation)

    proc.kill.assert_called_once()
    proc.wait.assert_awaited()

    evaluation.refresh_from_db()
    assert evaluation.state == NixEvaluation.EvaluationState.CRASHED


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_no_kill_when_process_already_exited(make_evaluation, make_channel):
    channel = make_channel()
    evaluation = make_evaluation(
        channel=channel, state=NixEvaluation.EvaluationState.PENDING
    )
    proc = _make_mock_process(returncode=1)
    git_repo, aio = _setup_mocks()

    with (
        patch("shared.listeners.nix_evaluation.perform_evaluation", return_value=proc),
        patch("shared.listeners.nix_evaluation.drain_lines", side_effect=_fake_drain),
        patch(
            "shared.listeners.nix_evaluation.realtime_batch_process_attributes",
            side_effect=RuntimeError("db error"),
        ),
        patch("shared.listeners.nix_evaluation.GitRepo", git_repo),
        patch("shared.listeners.nix_evaluation.aiofiles", aio),
    ):
        await evaluation_entrypoint(0.0, evaluation)

    proc.kill.assert_not_called()
