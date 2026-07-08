"""
Tests locking and retry handling when fetching a Git repository.
"""

import asyncio
import time
from collections.abc import Sequence
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from shared.git import GitRepo, RepositoryError


def _proc(command: str, rc: int, stderr: bytes = b"") -> MagicMock:
    p = MagicMock()
    p.command = command.split(" ")
    p.communicate = AsyncMock(return_value=(b"", stderr))
    p.wait = AsyncMock(return_value=rc)
    return p


def _run(
    processes: Sequence[MagicMock],
    getmtime_side_effect: object = FileNotFoundError,
    max_attempts: int = 3,
    object_sha1: str = "a" * 40,
) -> tuple[object, AsyncMock, AsyncMock, AsyncMock]:
    repo = GitRepo("/nonexistent/repo")
    exec_mock = AsyncMock(side_effect=list(processes))
    sleep_mock = AsyncMock()
    remove_mock = MagicMock()
    getmtime_mock = MagicMock(side_effect=getmtime_side_effect)

    async def _go() -> object:
        try:
            return await repo.update_from_ref(object_sha1, max_attempts=max_attempts)
        except Exception as e:
            return e

    with (
        patch.object(repo, "execute_git_command", exec_mock),
        patch("shared.git.asyncio.sleep", sleep_mock),
        patch("shared.git.os.path.getmtime", getmtime_mock),
        patch("shared.git.os.remove", remove_mock),
    ):
        result = asyncio.run(_go())

    # Validate that mocked processes lined up with real call sites:
    # The Nth call to `execute_git_command` should contain the Nth expected process's `command` substring.
    expected = [p.command for p in processes[: exec_mock.await_count]]
    actual = [call.args for call in exec_mock.await_args_list]
    for command, signature in zip(actual, expected, strict=True):
        assert list(command[: len(signature)]) == signature, (
            f"expected a {signature!r} command, got: {command!r}"
        )

    return result, exec_mock, sleep_mock, remove_mock


def test_returns_false_when_commit_already_present() -> None:
    # `git cat-file` returning 0 means the commit is already in the local repo.
    result, exec_mock, sleep_mock, _ = _run([_proc("git cat-file", 0)])
    assert result is False
    assert exec_mock.await_count == 1
    sleep_mock.assert_not_awaited()


def test_fetches_successfully_first_attempt() -> None:
    result, exec_mock, sleep_mock, _ = _run(
        [_proc("git cat-file", 1), _proc("git fetch", 0)]
    )
    assert result is True
    assert exec_mock.await_count == 2
    sleep_mock.assert_not_awaited()


def test_retries_then_succeeds_on_lock_contention() -> None:
    result, exec_mock, sleep_mock, _ = _run(
        [
            _proc("git cat-file", 1),
            _proc("git fetch", 128, b"fatal: cannot lock ref\n"),
            _proc("git fetch", 0),
        ]
    )
    assert result is True
    assert exec_mock.await_count == 3
    sleep_mock.assert_awaited_once()


def _lock_err() -> MagicMock:
    return _proc(
        "git fetch", 128, b"fatal: shallow file has changed since we read it\n"
    )


@pytest.mark.parametrize("max_attempts", [1, 2, 5])
def test_raises_when_every_attempt_locks(max_attempts: int) -> None:
    # Whatever the retry budget is, if every attempt sees a lock, we raise.
    result, *_ = _run(
        [_proc("git cat-file", 1), *(_lock_err() for _ in range(max_attempts))],
        max_attempts=max_attempts,
    )
    assert isinstance(result, RepositoryError)
    assert "exceeded" in str(result)


@pytest.mark.parametrize("max_attempts", [2, 5])
def test_succeeds_when_the_last_allowed_attempt_wins(max_attempts: int) -> None:
    # With one fewer lock error than the budget, fetch on the final attempt and succeed.
    fetches = [_lock_err() for _ in range(max_attempts - 1)] + [_proc("git fetch", 0)]
    result, *_ = _run(
        [_proc("git cat-file", 1), *fetches],
        max_attempts=max_attempts,
    )
    assert result is True


def test_raises_immediately_on_non_lock_error() -> None:
    result, exec_mock, sleep_mock, _ = _run(
        [
            _proc("git cat-file", 1),
            _proc("git fetch", 128, b"fatal: remote hung up unexpectedly\n"),
        ]
    )
    assert isinstance(result, RepositoryError)
    assert "failed to fetch" in str(result)
    assert exec_mock.await_count == 2
    sleep_mock.assert_not_awaited()


def test_removes_stale_lock() -> None:
    # A `getmtime` far in the past triggers the stale-lock cleanup.
    _, _, _, remove_mock = _run(
        [_proc("git cat-file", 1), _proc("git fetch", 0)],
        getmtime_side_effect=lambda _: 0.0,  # epoch == ancient
    )
    remove_mock.assert_called_once()
    assert remove_mock.call_args.args[0].endswith("shallow.lock")


def test_does_not_remove_fresh_lock() -> None:
    _, _, _, remove_mock = _run(
        [_proc("git cat-file", 1), _proc("git fetch", 0)],
        getmtime_side_effect=lambda _: time.time(),
    )
    remove_mock.assert_not_called()


def test_missing_lock_file_does_not_error() -> None:
    # No `shallow.lock` present: `getmtime` raises FileNotFoundError,
    # which the function swallows and proceeds to fetch normally.
    result, exec_mock, _, remove_mock = _run(
        [_proc("git cat-file", 1), _proc("git fetch", 0)]
    )
    assert result is True
    assert exec_mock.await_count == 2
    remove_mock.assert_not_called()


@pytest.mark.parametrize("rc", [128, 1])
def test_unrelated_shallow_error_does_not_retry(rc: int) -> None:
    # The stderr matcher looks for "shallow.lock" verbatim.
    # An unrelated error containing only "shallow" must not trigger a retry.
    result, _, sleep_mock, _ = _run(
        [
            _proc("git cat-file", 1),
            _proc("git fetch", rc, b"fatal: shallow clone has no parent\n"),
        ]
    )
    assert isinstance(result, RepositoryError)
    sleep_mock.assert_not_awaited()
