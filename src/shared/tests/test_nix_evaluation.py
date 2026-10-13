import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from shared.listeners.nix_evaluation import evaluation_entrypoint
from shared.models.nix_evaluation import NixEvaluation

MODULE = "shared.listeners.nix_evaluation"


@pytest.fixture
def eval_process():
    proc = AsyncMock()
    proc.stdout = AsyncMock(spec=asyncio.StreamReader)
    proc.returncode = None
    proc.kill = MagicMock()
    proc.wait = AsyncMock(return_value=0)
    return proc


@pytest.fixture
def exited_process(eval_process):
    eval_process.returncode = 1
    return eval_process


@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    worktree = MagicMock()
    worktree.path = "/tmp/fake-worktree"

    @asynccontextmanager
    async def fake_extract(*_a):
        yield worktree

    repo.extract_working_tree = fake_extract
    return MagicMock(return_value=repo)


@pytest.fixture
def mock_aiofiles():
    log_file = MagicMock()
    log_file.fileno.return_value = 99

    @asynccontextmanager
    async def fake_open(*_a, **_kw):
        yield log_file

    aio = MagicMock()
    aio.open = fake_open
    return aio


async def _fake_drain(_stdout):
    yield [b'{"attr":"foo","drvPath":"/nix/store/foo.drv"}']


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_subprocess_killed_on_ingestion_failure(
    make_evaluation, make_channel, eval_process, mock_repo, mock_aiofiles
):
    channel = make_channel()
    evaluation = make_evaluation(
        channel=channel, state=NixEvaluation.EvaluationState.PENDING
    )

    with (
        patch(f"{MODULE}.perform_evaluation", AsyncMock(return_value=eval_process)),
        patch(f"{MODULE}.drain_lines", side_effect=_fake_drain),
        patch(
            f"{MODULE}.realtime_batch_process_attributes",
            AsyncMock(side_effect=RuntimeError("db connection lost")),
        ),
        patch(f"{MODULE}.GitRepo", mock_repo),
        patch(f"{MODULE}.aiofiles", mock_aiofiles),
    ):
        await evaluation_entrypoint(0.0, evaluation)

    eval_process.kill.assert_called_once()
    eval_process.wait.assert_awaited()

    await evaluation.arefresh_from_db()
    assert evaluation.state == NixEvaluation.EvaluationState.CRASHED


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_no_kill_when_process_already_exited(
    make_evaluation, make_channel, exited_process, mock_repo, mock_aiofiles
):
    channel = make_channel()
    evaluation = make_evaluation(
        channel=channel, state=NixEvaluation.EvaluationState.PENDING
    )

    with (
        patch(f"{MODULE}.perform_evaluation", AsyncMock(return_value=exited_process)),
        patch(f"{MODULE}.drain_lines", side_effect=_fake_drain),
        patch(
            f"{MODULE}.realtime_batch_process_attributes",
            AsyncMock(side_effect=RuntimeError("db error")),
        ),
        patch(f"{MODULE}.GitRepo", mock_repo),
        patch(f"{MODULE}.aiofiles", mock_aiofiles),
    ):
        await evaluation_entrypoint(0.0, evaluation)

    exited_process.kill.assert_not_called()
