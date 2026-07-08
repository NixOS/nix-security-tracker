import secrets
from collections.abc import Callable

import pytest

from shared.listeners.nix_channels import (
    start_evaluation_jobs_upon_insertion,
    start_evaluation_jobs_upon_updates,
)
from shared.models import NixChannel, NixEvaluation

VARIANTS = [*NixChannel.Variant, None]


@pytest.mark.parametrize("variant", VARIANTS)
def test_insertion_enqueues_only_for_small_channel(
    make_channel: Callable[..., NixChannel],
    variant: NixChannel.Variant | None,
) -> None:
    channel = make_channel(
        channel_branch="nixos-25.05-small",
        state=NixChannel.ChannelState.STABLE,
        variant=variant,
    )
    start_evaluation_jobs_upon_insertion(old=None, new=channel)
    assert NixEvaluation.objects.filter(channel=channel).exists() == (
        variant == NixChannel.Variant.SMALL
    )


@pytest.mark.parametrize("variant", VARIANTS)
def test_update_enqueues_only_for_small_channel(
    make_channel: Callable[..., NixChannel],
    variant: NixChannel.Variant | None,
) -> None:
    channel = make_channel(
        channel_branch="nixos-25.05-small",
        state=NixChannel.ChannelState.STABLE,
        variant=variant,
    )
    old_commit = channel.head_sha1_commit
    channel.head_sha1_commit = secrets.token_hex(16)
    old = NixChannel(channel_branch=channel.channel_branch, head_sha1_commit=old_commit)
    start_evaluation_jobs_upon_updates(old=old, new=channel)
    assert NixEvaluation.objects.filter(channel=channel).exists() == (
        variant == NixChannel.Variant.SMALL
    )
