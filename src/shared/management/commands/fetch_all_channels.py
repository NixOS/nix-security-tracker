from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand

from shared.git import get_head_sha1
from shared.hydra import default_client, jobset_from_job
from shared.models.nix_evaluation import NixChannel, NixpkgsBranch
from shared.release_channels import Channel, channels


class Command(BaseCommand):
    help = "Fetch current Nixpkgs channel tips and update source branches"

    def handle(self, *args: Any, **kwargs: Any) -> str | None:
        client = default_client()
        # Small channels first so the other variants can inherit their branch commit.
        sorted_channels = sorted(
            channels.items(), key=lambda item: item[1].variant != Channel.Variant.SMALL
        )

        for channel_name, channel in sorted_channels:
            jobset_path = jobset_from_job(channel.job)
            jobset = client.get_jobset(jobset_path)
            branch_name = jobset.input_branch(
                "nixpkgs", default=settings.TRACKING_BRANCH
            )

            if channel.variant == channel.Variant.SMALL:
                commit_sha1 = get_head_sha1(settings.GIT_CLONE_URL, branch_name)
                branch, _ = NixpkgsBranch.objects.update_or_create(
                    name=branch_name,
                    defaults={
                        "head_sha1_commit": commit_sha1,
                        "repository": str(settings.GIT_CLONE_URL),
                    },
                )
            else:
                branch = NixpkgsBranch.objects.get(name=branch_name)

            ch, created = NixChannel.objects.update_or_create(
                channel_branch=channel_name,
                defaults={
                    "release_branch": branch,
                    "state": channel.status,
                    "head_sha1_commit": branch.head_sha1_commit,
                },
            )
            self.stdout.write(
                f"Channel {ch.channel_branch} ({ch.state}) {'created at' if created else 'updated to'} {branch.head_sha1_commit[:8]}"
            )
