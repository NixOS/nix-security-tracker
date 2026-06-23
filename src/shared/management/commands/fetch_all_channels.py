import asyncio
import sys
from collections.abc import Coroutine
from dataclasses import dataclass
from pprint import pprint
from typing import Any

import requests
from django.conf import settings
from django.core.management.base import BaseCommand

from shared.git import GitRepo
from shared.models.nix_evaluation import NixChannel, release_branch


@dataclass
class MonitoredChannel:
    name: str
    revision: str
    status: str


def aggregate_by_channels(data: list[dict[str, Any]]) -> dict[str, MonitoredChannel]:
    channels = {}
    for metric in data:
        m = metric["metric"]
        channels[m["channel"]] = MonitoredChannel(
            name=m["channel"], revision=m["revision"], status=m["status"]
        )
    return channels


def fetch_from_monitoring() -> dict[str, MonitoredChannel]:
    resp = requests.get(
        # XXX(@fricklerhandwerk): The sources for this are declared in the `NixOS/infra` repo. [tag:channel-structure]
        # exporter logic:
        # https://github.com/NixOS/infra/blob/795508213eb35eee099b1b8d12dd46a9f7b03697/build/pluto/prometheus/exporters/channel-exporter.py#L13-L17
        # systemd service:
        # https://github.com/NixOS/infra/blob/795508213eb35eee099b1b8d12dd46a9f7b03697/build/pluto/prometheus/exporters/channel.nix#L4-L6
        # channel structure:
        # https://github.com/NixOS/infra/blob/795508213eb35eee099b1b8d12dd46a9f7b03697/channels.nix
        settings.CHANNEL_MONITORING_URL
    )
    resp.raise_for_status()
    return aggregate_by_channels(resp.json()["data"]["result"])


async def wait_for_parallel_fetches(
    parallel_fetches: list[Coroutine[Any, Any, bool]],
) -> list[Any]:
    return await asyncio.gather(*parallel_fetches, return_exceptions=True)


class Command(BaseCommand):
    help = "Register Nix channels"

    def handle(self, *args: Any, **kwargs: Any) -> str | None:
        fresh_channels = fetch_from_monitoring()
        for channel in fresh_channels.values():
            channel_branch = channel.name
            branch_info = {
                "release_branch": release_branch(channel.name),
                "state": NixChannel.ChannelState(channel.status),
                "head_sha1_commit": channel.revision,
            }
            pprint(branch_info | {"channel_branch": channel.name})
            NixChannel.objects.update_or_create(
                branch_info, channel_branch=channel_branch
            )

        repo = GitRepo(
            settings.LOCAL_NIXPKGS_CHECKOUT,
            stderr=sys.stderr.fileno(),
        )
        parallel_fetches = []
        for channel in NixChannel.objects.iterator():
            parallel_fetches.append(repo.update_from_ref(channel.head_sha1_commit))

        results = asyncio.run(wait_for_parallel_fetches(parallel_fetches))
        # FIXME(@fricklerhandwerk): Fold that into `branch_info`, so there's only one output.
        print("Parallel fetches results", results)
