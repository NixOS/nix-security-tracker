import asyncio
import os
import signal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from shared.listeners.nix_evaluation import CRASH_SIGNALS
from shared.models.nix_evaluation import NixEvaluation


def _make_fake_process(returncode: int) -> MagicMock:
    """Create a mock asyncio.subprocess.Process with a given returncode."""
    process = MagicMock()
    process.returncode = returncode
    # stdout that immediately yields EOF
    stdout = AsyncMock()
    stdout.readline = AsyncMock(return_value=b"")
    process.stdout = stdout
    process.wait = AsyncMock(return_value=returncode)
    return process


@pytest.fixture()
def evaluation_for_crash_test(make_evaluation, make_channel):
    channel = make_channel()
    return make_evaluation(
        channel=channel,
        state=NixEvaluation.EvaluationState.WAITING,
    )


def _run_entrypoint(evaluation: NixEvaluation, returncode: int) -> None:
    """Run evaluation_entrypoint with a mocked subprocess returning the given code."""
    fake_process = _make_fake_process(returncode)

    with (
        patch(
            "shared.listeners.nix_evaluation.perform_evaluation",
            AsyncMock(return_value=fake_process),
        ),
        patch("shared.listeners.nix_evaluation.GitRepo"),
        patch("shared.listeners.nix_evaluation.aiofiles.open", new_callable=MagicMock),
    ):
        from shared.listeners.nix_evaluation import evaluation_entrypoint

        asyncio.run(evaluation_entrypoint(0.0, evaluation))


def _observed_returncode_for_signal(sig: signal.Signals) -> int:
    """Spawn a real subprocess via asyncio, send it a signal, return the actual returncode.

    This grounds our tests in observed behavior rather than assumed conventions.
    """

    async def _inner():
        proc = await asyncio.create_subprocess_exec(
            "sleep", "60",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await asyncio.sleep(0.1)
        os.kill(proc.pid, sig)
        return await proc.wait()

    return asyncio.run(_inner())


class TestObservedReturnCodes:
    """Verify that asyncio subprocess return codes match what CRASH_SIGNALS expects."""

    def test_sigsegv_returncode_is_in_crash_signals(self):
        rc = _observed_returncode_for_signal(signal.SIGSEGV)
        assert rc in CRASH_SIGNALS, (
            f"SIGSEGV produced returncode {rc} which is not in CRASH_SIGNALS {CRASH_SIGNALS}"
        )

    def test_sigabrt_returncode_is_in_crash_signals(self):
        rc = _observed_returncode_for_signal(signal.SIGABRT)
        assert rc in CRASH_SIGNALS, (
            f"SIGABRT produced returncode {rc} which is not in CRASH_SIGNALS {CRASH_SIGNALS}"
        )

    def test_normal_exit_not_in_crash_signals(self):
        """A process that exits normally should not be detected as a crash."""

        async def _inner():
            proc = await asyncio.create_subprocess_exec(
                "true",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            return await proc.wait()

        rc = asyncio.run(_inner())
        assert rc not in CRASH_SIGNALS

    def test_nonzero_exit_not_in_crash_signals(self):
        """A process that fails (non-zero) but wasn't signalled should not be a crash."""

        async def _inner():
            proc = await asyncio.create_subprocess_exec(
                "false",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            return await proc.wait()

        rc = asyncio.run(_inner())
        assert rc not in CRASH_SIGNALS


@pytest.mark.django_db
class TestEvaluationCrashDetection:
    """Test that evaluation_entrypoint correctly maps return codes to states,
    using return codes observed from real subprocess signal delivery."""

    def test_sigsegv_marks_crashed(self, evaluation_for_crash_test):
        rc = _observed_returncode_for_signal(signal.SIGSEGV)
        _run_entrypoint(evaluation_for_crash_test, rc)
        evaluation_for_crash_test.refresh_from_db()
        assert evaluation_for_crash_test.state == NixEvaluation.EvaluationState.CRASHED

    def test_sigabrt_marks_crashed(self, evaluation_for_crash_test):
        rc = _observed_returncode_for_signal(signal.SIGABRT)
        _run_entrypoint(evaluation_for_crash_test, rc)
        evaluation_for_crash_test.refresh_from_db()
        assert evaluation_for_crash_test.state == NixEvaluation.EvaluationState.CRASHED

    def test_nonzero_exit_marks_failed(self, evaluation_for_crash_test):
        _run_entrypoint(evaluation_for_crash_test, 1)
        evaluation_for_crash_test.refresh_from_db()
        assert evaluation_for_crash_test.state == NixEvaluation.EvaluationState.FAILED

    def test_zero_exit_marks_completed(self, evaluation_for_crash_test):
        _run_entrypoint(evaluation_for_crash_test, 0)
        evaluation_for_crash_test.refresh_from_db()
        assert evaluation_for_crash_test.state == NixEvaluation.EvaluationState.COMPLETED
