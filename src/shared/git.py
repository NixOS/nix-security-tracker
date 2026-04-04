import asyncio
import itertools
import logging
import os
import os.path
import pathlib
import time
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import IO, Any

from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass
class Worktree:
    path: pathlib.Path
    revision: str
    detached: bool
    prunable: bool

    @classmethod
    def parse_from_porcelain(
        cls: type["Worktree"], porcelain: list[str]
    ) -> "Worktree | None":
        path = porcelain[0].split(" ")[1]
        if porcelain[1] == "bare":
            return None

        revision = porcelain[1].split(" ")[1]
        detached = porcelain[2] == "detached"
        if len(porcelain) >= 4:
            prunable = porcelain[3].startswith("prunable")
        else:
            prunable = False
        return Worktree(
            path=pathlib.Path(path),
            revision=revision,
            detached=detached,
            prunable=prunable,
        )

    def name(self) -> str:
        """
        By default, `git` uses the basename
        of the target path to name a worktree.
        """
        return os.path.basename(str(self.path))


class RepositoryError(Exception):
    pass


class GitRepo:
    def __init__(
        self,
        repo_path: str,
        stdout: int | IO[Any] | None = None,
        stderr: int | IO[Any] | None = None,
    ) -> None:
        self.stdout = stdout
        self.stderr = stderr
        self.repo_path = repo_path

    async def execute_git_command(
        self,
        cmd: str,
        stdout: int | IO[Any] | None = None,
        stderr: int | IO[Any] | None = None,
    ) -> asyncio.subprocess.Process:
        final_stdout = stdout or self.stdout or asyncio.subprocess.PIPE
        final_stderr = stderr or self.stderr or asyncio.subprocess.PIPE
        return await asyncio.create_subprocess_shell(
            cmd, cwd=self.repo_path, stdout=final_stdout, stderr=final_stderr
        )

    async def clone(
        self, reference_repo_path: str | None = None
    ) -> asyncio.subprocess.Process:
        """
        Clones the repository.
        If you pass a `reference_repo_path`, the cloning will be much faster.

        Otherwise, it will use a shallow clone, since we can fetch commits manually.
        """
        repo_clone_url = settings.GIT_CLONE_URL
        stdout = self.stdout or asyncio.subprocess.PIPE
        stderr = self.stderr or asyncio.subprocess.PIPE
        if reference_repo_path is not None:
            clone_process = await asyncio.create_subprocess_shell(
                f"git clone --depth=1 --bare --progress --reference={reference_repo_path} {repo_clone_url} {self.repo_path}",
                stdout=stdout,
                stderr=stderr,
            )
        else:
            clone_process = await asyncio.create_subprocess_shell(
                f"git clone --depth=1 --bare --progress {repo_clone_url} {self.repo_path}",
                stdout=stdout,
                stderr=stderr,
            )

        return clone_process

    async def worktrees(self) -> list[Worktree]:
        """
        Returns a list of relevant worktrees,
        e.g. filter out the `bare` worktree.
        """
        process = await self.execute_git_command(
            "git worktree list -z --porcelain", stdout=asyncio.subprocess.PIPE
        )
        stdout, _ = await process.communicate()
        parts = stdout.split(b"\x00")
        assert parts[-1] == b"", "Worktrees list are not terminated by a NUL character"
        parts = [part.decode("utf8") for part in parts]
        return list(
            filter(
                None,
                [
                    Worktree.parse_from_porcelain(list(group))
                    for k, group in itertools.groupby(parts, lambda x: x == "")
                    if not k
                ],
            )
        )

    async def _wait_for_shallow_lock(
        self, lock_timeout: float = 300.0, stale_threshold: float = 300.0
    ) -> None:
        """
        Wait for `shallow.lock` to be released, with stale-lock detection.

        If the lock file exists for longer than `lock_timeout` seconds, check
        its mtime. If it is older than `stale_threshold` seconds, remove it
        as a likely leftover from a crashed process.
        """
        lock_path = os.path.join(self.repo_path, "shallow.lock")
        waited = 0.0
        poll_interval = 1.0

        while os.path.exists(lock_path):
            if waited == 0.0:
                logger.warning(
                    "shallow.lock exists in %s, waiting for it to be released...",
                    self.repo_path,
                )

            if waited >= lock_timeout:
                try:
                    lock_mtime = os.path.getmtime(lock_path)
                    lock_age = time.time() - lock_mtime
                except OSError:
                    # Lock disappeared between the exists() check and getmtime()
                    break

                if lock_age >= stale_threshold:
                    logger.warning(
                        "Removing stale shallow.lock (age: %.0fs) in %s",
                        lock_age,
                        self.repo_path,
                    )
                    try:
                        os.remove(lock_path)
                    except FileNotFoundError:
                        pass
                    break
                else:
                    raise RepositoryError(
                        f"shallow.lock in {self.repo_path} held for {waited:.0f}s "
                        f"but lock file is only {lock_age:.0f}s old; another process "
                        f"may be stuck"
                    )

            await asyncio.sleep(poll_interval)
            waited += poll_interval

    async def update_from_ref(
        self,
        object_sha1: str,
        max_retries: int = 5,
        lock_timeout: float = 300.0,
    ) -> bool:
        """
        This checks if `object_sha1` is already present in the repo or not.
        If not, perform a fetch to our remote to obtain it.

        Returns whether this was fetched or already present.
        """
        repo_clone_url = settings.GIT_CLONE_URL
        exists = (
            await (
                await self.execute_git_command(
                    f"git cat-file commit {object_sha1}",
                    stderr=asyncio.subprocess.PIPE,
                )
            ).wait()
            == 0
        )
        if exists:
            return False
        else:
            for attempt in range(1, max_retries + 1):
                await self._wait_for_shallow_lock(lock_timeout=lock_timeout)
                process = await self.execute_git_command(
                    f"git fetch --porcelain --depth=1 {repo_clone_url} {object_sha1}",
                    stderr=asyncio.subprocess.PIPE,
                )
                _, stderr = await process.communicate()
                rc = await process.wait()
                locking_problem = "shallow" in stderr.decode("utf8")
                if rc == 0:
                    return True
                if locking_problem:
                    backoff = min(2**attempt, 30)
                    logger.warning(
                        "git fetch for %s hit shallow lock contention "
                        "(attempt %d/%d), retrying in %ds...",
                        object_sha1[:8],
                        attempt,
                        max_retries,
                        backoff,
                    )
                    await asyncio.sleep(backoff)
                    continue
                logger.error("git fetch stderr: %s", stderr.decode("utf8"))
                raise RepositoryError(
                    f"failed to fetch {object_sha1} while running "
                    f"`git fetch --depth=1 {repo_clone_url} {object_sha1}`"
                )
            raise RepositoryError(
                f"failed to fetch {object_sha1} after {max_retries} attempts "
                f"due to persistent shallow lock contention"
            )

    async def remove_working_tree(self, name: str) -> bool:
        """
        This deletes the working tree, if it exists.

        Returns `True` if it does exist, otherwise `False`.
        """
        process = await self.execute_git_command(f"git worktree remove {name}")
        deleted = await process.wait() == 0

        return deleted

    async def prune_working_trees(self) -> bool:
        """
        This prunes all the working trees, if possible.

        Returns `True` if it does get pruned, otherwise `False`.
        """
        process = await self.execute_git_command("git worktree prune")
        pruned = await process.wait() == 0

        return pruned

    @asynccontextmanager
    async def extract_working_tree(
        self, commit_sha1: str, target_path: str
    ) -> AsyncGenerator[Worktree]:
        """
        This will extract the working tree represented at the reference
        induced by the object's commit SHA1 into the `target_path`.

        This returns it as an asynchronous context manager.
        """
        path = pathlib.Path(target_path)
        worktrees = {wt.path: wt for wt in await self.worktrees()}
        existing_wt = worktrees.get(path)
        if existing_wt is not None and not existing_wt.prunable:
            raise RepositoryError(
                f"failed to perform extraction of the worktree at {target_path} for commit {commit_sha1}, such a worktree already exist!"
            )
        if existing_wt is not None and existing_wt.prunable:
            await self.prune_working_trees()

        process = await self.execute_git_command(
            f"git worktree add {target_path} {commit_sha1}"
        )
        created = await process.wait() == 0

        if not created:
            raise RepositoryError(
                f"failed to perform extraction of the worktree at {target_path} for commit {commit_sha1}, cannot create it!"
            )

        wt = None
        try:
            wt = Worktree(
                path=pathlib.Path(target_path),
                revision=commit_sha1,
                detached=True,
                prunable=False,
            )
            yield wt
        finally:
            if wt is not None:
                await self.remove_working_tree(wt.name())
