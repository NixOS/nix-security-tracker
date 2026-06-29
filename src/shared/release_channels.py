from enum import StrEnum

from pydantic import BaseModel

from shared._release_channels import (  # type: ignore[reportMissingImports]
    channels as _raw,  # Populated at build time from `github:NixOS/infra//channels.nix`
)
from shared.models.nix_evaluation import NixChannel

ChannelState = NixChannel.ChannelState


class Channel(BaseModel):
    """
    A Nixpkgs release channel as defined in `NixOS/infra`.
    """

    class Variant(StrEnum):
        PRIMARY = "primary"
        SMALL = "small"
        DARWIN = "darwin"

    job: str
    status: ChannelState
    variant: Variant | None = None


channels: dict[str, Channel] = {
    name: Channel(**data)  # type: ignore[reportArgumentType]
    for name, data in _raw.items()
}
