import re
from io import StringIO
from pprint import pprint
from typing import Annotated, Any

import requests
from django.conf import settings
from django.core.management.base import BaseCommand
from pydantic import BaseModel, ConfigDict, Field, model_validator

from shared.models.nix_evaluation import NixChannel


class MonitoredChannel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    channel: str
    release_branch: str
    revision: Annotated[str, Field(pattern="[0-9a-f]{40}")]
    status: NixChannel.ChannelState
    variant: NixChannel.Variant | None = None

    @model_validator(mode="before")
    @classmethod
    def parse_channel_name(cls, data: Any) -> Any:
        """
        This is a heuristic for deriving the release branch from a channel's name.
        The Technically Correct way to obtain that value would be to
        1. Take the underlying `channels.nix` from `github:NixOS/infra` for jobsets and channel states
        2. Resolve the associated branch names and commits through Hydra
        because those are the authoritative sources.

        But that would require hitting Hydra with 3 roundtrips per channel and parsing all the responses.
        Therefore we'll only implement that if the flexibility is actually required.
        """
        name = data.get("channel", "")
        match = re.match(
            r"^(?P<jobset>nixos|nixpkgs)-(?P<release>\d\d\.\d\d|unstable)(?:-(?P<variant>primary|small|darwin))?$",
            name,
        )
        if match is None:
            raise ValueError(f"unexpected channel name: {name!r}")
        release = match.group("release")
        release_branch = "master" if release == "unstable" else f"release-{release}"
        return {
            **data,
            "release_branch": release_branch,
        }


def fetch_from_monitoring() -> list[MonitoredChannel]:
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
    channels = []
    for metric in resp.json()["data"]["result"]:
        channels.append(MonitoredChannel.model_validate(metric["metric"]))
    return channels


class Command(BaseCommand):
    help = "Fetch current channel tips"

    def handle(self, *args: Any, **kwargs: Any) -> str | None:
        for monitored in fetch_from_monitoring():
            channel, _ = NixChannel.objects.update_or_create(
                channel_branch=monitored.channel,
                defaults=dict(
                    release_branch=monitored.release_branch,
                    head_sha1_commit=monitored.revision,
                    state=monitored.status,
                    variant=monitored.variant,
                ),
            )

            # Can't `pprint()` to `self.stdout` directly...
            stream = StringIO()
            pprint(monitored.__dict__, stream=stream)
            self.stdout.write(stream.getvalue())
