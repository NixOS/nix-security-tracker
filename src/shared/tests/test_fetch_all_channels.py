from collections.abc import Callable, Generator
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest
from django.conf import settings
from django.core.management import call_command

from shared.hydra import Jobset, JobsetInput, jobset_from_job
from shared.models.nix_evaluation import NixChannel, NixpkgsBranch
from shared.release_channels import Channel, ChannelState


def test_jobset_from_job() -> None:
    assert jobset_from_job("nixos/release-26.05/tested") == "nixos/release-26.05"


def test_jobset_from_job_unstable() -> None:
    assert jobset_from_job("nixpkgs/unstable/unstable") == "nixpkgs/unstable"


@pytest.fixture
def make_jobset() -> Callable[[str], Jobset]:
    def wrapped(value: str) -> Jobset:
        return Jobset(inputs={"nixpkgs": JobsetInput(value=value)})

    return wrapped


def test_input_branch_stable(make_jobset: Callable[[str], Jobset]) -> None:
    jobset = make_jobset("https://github.com/NixOS/nixpkgs.git release-26.05")
    assert jobset.input_branch("nixpkgs", default="master") == "release-26.05"


def test_input_branch_default(make_jobset: Callable[[str], Jobset]) -> None:
    """
    A jobset input value without a branch field falls back to `default`.
    """
    jobset = make_jobset("https://github.com/NixOS/nixpkgs.git")
    assert jobset.input_branch("nixpkgs", default="master") == "master"


@pytest.fixture
def mock_hydra() -> Callable:
    @contextmanager
    def factory(channels: dict, jobsets: dict) -> Generator[None]:
        client = MagicMock()
        client.get_jobset.side_effect = jobsets.get
        with (
            patch(
                "shared.management.commands.fetch_all_channels.channels",
                channels,
            ),
            patch(
                "shared.management.commands.fetch_all_channels.default_client",
                return_value=client,
            ),
        ):
            yield

    return factory


@pytest.fixture
def mock_head_sha1() -> Callable:
    @contextmanager
    def factory(branch_shas: dict[str, str]) -> Generator[None]:
        with patch(
            "shared.management.commands.fetch_all_channels.get_head_sha1",
            side_effect=lambda url, branch: branch_shas[branch],
        ):
            yield

    return factory


@pytest.mark.django_db
def test_fetch_all_channels_creates_nix_branches(
    mock_hydra: Callable, mock_head_sha1: Callable
) -> None:
    with (
        mock_hydra(
            channels={
                "nixpkgs-unstable": Channel(
                    job="nixpkgs/unstable/unstable",
                    status=ChannelState.UNSTABLE,
                    variant=Channel.Variant.PRIMARY,
                ),
                "nixos-unstable-small": Channel(
                    job="nixos/unstable-small/tested",
                    status=ChannelState.UNSTABLE,
                    variant=Channel.Variant.SMALL,
                ),
                "nixos-25.05-small": Channel(
                    job="nixos/release-25.05-small/tested",
                    status=ChannelState.STABLE,
                    variant=Channel.Variant.SMALL,
                ),
            },
            jobsets={
                "nixpkgs/unstable": Jobset(
                    inputs={"nixpkgs": JobsetInput(value=f"{settings.GIT_CLONE_URL}")},
                ),
                "nixos/unstable-small": Jobset(
                    inputs={"nixpkgs": JobsetInput(value=f"{settings.GIT_CLONE_URL}")},
                ),
                "nixos/release-25.05-small": Jobset(
                    inputs={
                        "nixpkgs": JobsetInput(
                            value=f"{settings.GIT_CLONE_URL} release-25.05"
                        )
                    }
                ),
            },
        ),
        mock_head_sha1(branch_shas={"master": "a" * 40, "release-25.05": "b" * 40}),
    ):
        call_command("fetch_all_channels")

    assert NixpkgsBranch.objects.filter(
        name=settings.TRACKING_BRANCH, head_sha1_commit="a" * 40
    ).exists()
    assert NixpkgsBranch.objects.filter(
        name="release-25.05", head_sha1_commit="b" * 40
    ).exists()
    assert NixChannel.objects.filter(channel_branch="nixpkgs-unstable").exists()
    assert NixChannel.objects.filter(channel_branch="nixos-unstable-small").exists()
    assert NixChannel.objects.filter(channel_branch="nixos-25.05-small").exists()


@pytest.mark.django_db
def test_fetch_all_channels_small_variant_updates_branch(
    mock_hydra: Callable, mock_head_sha1: Callable
) -> None:
    """
    Only small-variant channels fetch the Git HEAD.
    All other channels reuse the already-fetched branch.
    """
    NixpkgsBranch.objects.create(name="master", head_sha1_commit="c" * 40)
    NixpkgsBranch.objects.create(name="release-25.05", head_sha1_commit="d" * 40)

    with (
        mock_hydra(
            channels={
                "nixpkgs-unstable": Channel(
                    job="nixpkgs/unstable/unstable",
                    status=ChannelState.UNSTABLE,
                    variant=Channel.Variant.PRIMARY,
                ),
                "nixos-unstable-small": Channel(
                    job="nixos/unstable-small/tested",
                    status=ChannelState.UNSTABLE,
                    variant=Channel.Variant.SMALL,
                ),
                "nixos-25.05-small": Channel(
                    job="nixos/release-25.05-small/tested",
                    status=ChannelState.STABLE,
                    variant=Channel.Variant.SMALL,
                ),
            },
            jobsets={
                "nixpkgs/unstable": Jobset(
                    inputs={"nixpkgs": JobsetInput(value=f"{settings.GIT_CLONE_URL}")},
                ),
                "nixos/unstable-small": Jobset(
                    inputs={"nixpkgs": JobsetInput(value=f"{settings.GIT_CLONE_URL}")},
                ),
                "nixos/release-25.05-small": Jobset(
                    inputs={
                        "nixpkgs": JobsetInput(
                            value=f"{settings.GIT_CLONE_URL} release-25.05"
                        )
                    },
                ),
            },
        ),
        mock_head_sha1(branch_shas={"master": "a" * 40, "release-25.05": "b" * 40}),
    ):
        call_command("fetch_all_channels")

    assert NixpkgsBranch.objects.get(name="master").head_sha1_commit == "a" * 40
    assert NixpkgsBranch.objects.get(name="release-25.05").head_sha1_commit == "b" * 40
