import asyncio
import signal
from collections.abc import Callable
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from shared.listeners.nix_evaluation import evaluation_entrypoint
from shared.models.nix_evaluation import NixEvaluation


@pytest.fixture
def waiting_evaluation(make_evaluation: Callable[..., NixEvaluation]) -> NixEvaluation:
    return make_evaluation(state=NixEvaluation.EvaluationState.WAITING)


def _run_entrypoint(evaluation: NixEvaluation, returncode: int) -> None:
    """Run evaluation_entrypoint with a mocked subprocess returning the given code."""
    process = MagicMock()
    process.returncode = returncode
    # stdout that immediately yields EOF
    stdout = AsyncMock()
    stdout.readline = AsyncMock(return_value=b"")
    process.stdout = stdout
    process.wait = AsyncMock(return_value=returncode)

    mock_repo = MagicMock()
    mock_repo.update_from_ref = AsyncMock()
    mock_git_repo = MagicMock(return_value=mock_repo)
    with (
        patch(
            "shared.listeners.nix_evaluation.perform_evaluation",
            AsyncMock(return_value=process),
        ),
        patch("shared.listeners.nix_evaluation.GitRepo", mock_git_repo),
        patch("shared.listeners.nix_evaluation.aiofiles.open", new_callable=MagicMock),
    ):
        asyncio.run(evaluation_entrypoint(0.0, evaluation))


@pytest.mark.django_db(transaction=True)
def test_sigsegv_marks_crashed(
    waiting_evaluation: NixEvaluation,
) -> None:
    _run_entrypoint(waiting_evaluation, -signal.SIGSEGV)
    waiting_evaluation.refresh_from_db()
    assert waiting_evaluation.state == NixEvaluation.EvaluationState.CRASHED


@pytest.mark.django_db(transaction=True)
def test_sigabrt_marks_crashed(
    waiting_evaluation: NixEvaluation,
) -> None:
    _run_entrypoint(waiting_evaluation, -signal.SIGABRT)
    waiting_evaluation.refresh_from_db()
    assert waiting_evaluation.state == NixEvaluation.EvaluationState.CRASHED


@pytest.mark.django_db(transaction=True)
def test_nonzero_exit_marks_failed(
    waiting_evaluation: NixEvaluation,
) -> None:
    _run_entrypoint(waiting_evaluation, 1)
    waiting_evaluation.refresh_from_db()
    assert waiting_evaluation.state == NixEvaluation.EvaluationState.FAILED


@pytest.mark.django_db(transaction=True)
def test_zero_exit_marks_completed(
    waiting_evaluation: NixEvaluation,
) -> None:
    _run_entrypoint(waiting_evaluation, 0)
    waiting_evaluation.refresh_from_db()
    assert waiting_evaluation.state == NixEvaluation.EvaluationState.COMPLETED
