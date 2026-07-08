from collections.abc import Callable, Generator
from contextlib import contextmanager
from unittest.mock import Mock, patch

import pytest
from django.core.management import call_command
from django.db import IntegrityError
from pydantic import AnyUrl

from shared.git import get_head_sha1
from shared.management.commands.fetch_all_channels import fetch_from_monitoring
from shared.models.nix_evaluation import NixChannel, NixpkgsBranch


def monitoring_response(*channels: dict) -> Mock:
    resp = Mock()
    resp.json.return_value = {"data": {"result": [{"metric": c} for c in channels]}}
    return resp


@pytest.mark.parametrize(
    "name,name_valid",
    [
        ("nixos-25.05", True),
        ("nixos-unstable", True),
        ("nixos", False),
        ("NixOS-25.05", False),
        ("--evil", False),
        ("", False),
    ],
)
@pytest.mark.parametrize(
    "revision,revision_valid",
    [
        ("a" * 40, True),
        ("abc123", False),
        ("z" * 40, False),
        ("--upload-pack=evil" + "a" * 21, False),
        ("", False),
    ],
)
@pytest.mark.parametrize(
    "status,status_valid",
    [
        ("stable", True),
        ("rolling", True),
        ("STABLE", False),
        ("1", False),
        ("", False),
    ],
)
def test_input_validation(
    name: str,
    name_valid: bool,
    revision: str,
    revision_valid: bool,
    status: str,
    status_valid: bool,
) -> None:
    with patch(
        "requests.get",
        return_value=monitoring_response(
            {"channel": name, "revision": revision, "status": status}
        ),
    ):
        if name_valid and revision_valid and status_valid:
            [channel] = fetch_from_monitoring()
            assert channel.channel == name
            assert channel.revision == revision
            assert channel.status == status
        else:
            with pytest.raises(Exception):
                fetch_from_monitoring()


def test_get_head_sha1_returns_commit() -> None:
    with patch(
        "subprocess.run",
        return_value=Mock(stdout=f"{'a' * 40}\trefs/heads/master\n"),
    ):
        assert (
            get_head_sha1(AnyUrl("https://github.com/NixOS/nixpkgs"), "master")
            == "a" * 40
        )


def test_get_head_sha1_raises_on_missing_branch() -> None:
    with patch("subprocess.run", return_value=Mock(stdout="")):
        with pytest.raises(ValueError, match="not found"):
            get_head_sha1(AnyUrl("https://github.com/NixOS/nixpkgs"), "nonexistent")


@pytest.mark.django_db
def test_nixpkgsbranch_rejects_invalid_sha1() -> None:
    with pytest.raises(IntegrityError):
        NixpkgsBranch.objects.create(name="master", head_sha1_commit="not-a-sha1")


@pytest.fixture
def mock_monitoring() -> Callable:
    @contextmanager
    def factory(*channels: dict) -> Generator[None]:
        with patch(
            "requests.get",
            return_value=monitoring_response(*channels),
        ):
            yield

    return factory


@pytest.fixture
def mock_head_sha1() -> Callable:
    @contextmanager
    def factory(branch_commits: dict[str, str]) -> Generator[None]:
        with patch(
            "shared.management.commands.fetch_all_channels.get_head_sha1",
            side_effect=lambda _, branch: branch_commits[branch],
        ):
            yield

    return factory


@pytest.mark.django_db
def test_handle_creates_branches(
    mock_monitoring: Callable, mock_head_sha1: Callable
) -> None:
    with (
        mock_monitoring(
            {
                "channel": "nixos-unstable",
                "revision": "a" * 40,
                "status": "rolling",
            },
            {
                "channel": "nixos-unstable-small",
                "revision": "b" * 40,
                "status": "rolling",
            },
        ),
        mock_head_sha1(branch_commits={"master": "c" * 40}),
    ):
        call_command("fetch_all_channels")

    assert NixpkgsBranch.objects.count() == 1
    assert NixpkgsBranch.objects.filter(
        name="master", head_sha1_commit="c" * 40
    ).exists()
    unstable = NixChannel.objects.get(channel_branch="nixos-unstable")
    assert unstable.head_sha1_commit == "a" * 40
    unstable_small = NixChannel.objects.get(channel_branch="nixos-unstable-small")
    assert unstable_small.head_sha1_commit == "b" * 40


@pytest.mark.django_db
def test_handle_updates_branch_head(
    mock_monitoring: Callable, mock_head_sha1: Callable
) -> None:
    NixpkgsBranch.objects.create(name="master", head_sha1_commit="f" * 40)

    with (
        mock_monitoring(
            {
                "channel": "nixos-unstable",
                "revision": "a" * 40,
                "status": "rolling",
            },
            {
                "channel": "nixos-unstable-small",
                "revision": "b" * 40,
                "status": "rolling",
            },
        ),
        mock_head_sha1(branch_commits={"master": "c" * 40}),
    ):
        call_command("fetch_all_channels")

    assert NixpkgsBranch.objects.get(name="master").head_sha1_commit == "c" * 40
