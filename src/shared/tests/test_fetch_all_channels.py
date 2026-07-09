from collections.abc import Callable, Generator
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest
from django.conf import settings
from django.core.management import call_command

from shared.hydra import Build, EvalInput, Evaluation, Jobset, JobsetInput
from shared.management.commands.fetch_all_channels import Channel, Job
from shared.models.nix_evaluation import NixChannel, NixpkgsBranch


@pytest.fixture
def mock_channels() -> Callable:
    default_channels = {
        "nixos-unstable": Channel.model_construct(
            job=Job(project="nixos", jobset="unstable", name="tested"),
            status=NixChannel.ChannelState.UNSTABLE,
            variant=NixChannel.Variant.PRIMARY,
        ),
        "nixos-unstable-small": Channel.model_construct(
            job=Job(project="nixos", jobset="unstable-small", name="tested"),
            status=NixChannel.ChannelState.UNSTABLE,
            variant=NixChannel.Variant.SMALL,
        ),
    }

    @contextmanager
    def factory(channels: dict[str, Channel] = default_channels) -> Generator[None]:
        with patch(
            "shared.management.commands.fetch_all_channels.channels",
            channels,
        ):
            yield

    return factory


@pytest.fixture
def mock_hydra() -> Callable:
    default_evaluation = Evaluation.model_construct(
        id=42,
        jobsetevalinputs={
            settings.HYDRA_INPUT_NAME: EvalInput(
                uri=settings.GIT_CLONE_URL,
                revision="c" * 40,
            )
        },
    )
    default_jobsets = {
        "nixos/unstable": Jobset.model_construct(
            inputs={
                settings.HYDRA_INPUT_NAME: JobsetInput.model_construct(
                    url=settings.GIT_CLONE_URL, branch=None
                )
            }
        ),
        "nixos/unstable-small": Jobset.model_construct(
            inputs={
                settings.HYDRA_INPUT_NAME: JobsetInput.model_construct(
                    url=settings.GIT_CLONE_URL, branch=None
                )
            }
        ),
    }

    @contextmanager
    def factory(
        jobsets: dict[str, Jobset] = default_jobsets,
        evaluation: Evaluation = default_evaluation,
    ) -> Generator[None]:
        client = MagicMock()
        client.get_jobset.side_effect = lambda project, jobset: jobsets[
            f"{project}/{jobset}"
        ]
        client.get_latest_build.return_value = Build(id=1, jobsetevals=[42])
        client.get_evaluation.return_value = evaluation
        with patch(
            "shared.hydra.default_client",
            return_value=client,
        ):
            yield

    return factory


@pytest.fixture
def mock_head_sha1() -> Callable:
    @contextmanager
    def factory(branch_shas: dict[str, str]) -> Generator[None]:
        with patch(
            "shared.management.commands.fetch_all_channels.get_head_sha1",
            side_effect=lambda _, branch: branch_shas[branch],
        ):
            yield

    return factory


@pytest.mark.django_db
def test_fetch_all_channels_creates_nix_branches(
    mock_channels: Callable, mock_hydra: Callable, mock_head_sha1: Callable
) -> None:
    with (
        mock_channels(),
        mock_hydra(),
        mock_head_sha1(branch_shas={"master": "a" * 40}),
    ):
        call_command("fetch_all_channels")

    assert NixpkgsBranch.objects.count() == 1
    assert NixpkgsBranch.objects.filter(
        name=settings.TRACKING_BRANCH, head_sha1_commit="a" * 40
    ).exists()
    assert NixChannel.objects.filter(channel_branch="nixos-unstable").exists()
    assert NixChannel.objects.filter(channel_branch="nixos-unstable-small").exists()


@pytest.mark.django_db
def test_fetch_all_channels_updates_branch_head(
    mock_channels: Callable, mock_hydra: Callable, mock_head_sha1: Callable
) -> None:
    """
    Only primary channels fetch the branch HEAD.
    Small channels sharing the same branch reuse the result.
    """
    NixpkgsBranch.objects.create(name="master", head_sha1_commit="b" * 40)

    with (
        mock_channels(),
        mock_hydra(),
        mock_head_sha1(branch_shas={"master": "a" * 40}),
    ):
        call_command("fetch_all_channels")

    assert NixpkgsBranch.objects.get(name="master").head_sha1_commit == "a" * 40
