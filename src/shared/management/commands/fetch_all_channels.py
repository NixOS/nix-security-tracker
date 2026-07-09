from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand
from pydantic import BaseModel, field_validator

# Populated at build time from `github:NixOS/infra//channels.nix`
from shared._release_channels import channels  # type: ignore[reportMissingImports]

from shared import hydra
from shared.git import get_head_sha1
from shared.models.nix_evaluation import NixChannel, NixpkgsBranch


class Job(BaseModel):
    project: hydra.ProjectName
    jobset: hydra.JobsetName
    name: hydra.JobName


class Channel(BaseModel):
    """
    A release channel as defined in `NixOS/infra`.
    """

    job: Job
    status: NixChannel.ChannelState
    variant: NixChannel.Variant | None = None

    @field_validator("job", mode="before")
    @classmethod
    def parse_job(cls, v: str) -> dict:
        project, jobset, name = v.split("/")
        return {"project": project, "jobset": jobset, "name": name}


class Command(BaseCommand):
    help = "Fetch current channel tips and update source branches"

    def handle(self, *args: Any, **kwargs: Any) -> str | None:
        client = hydra.default_client()

        # FIXME(@fricklerhandwerk): Run requests async.
        for channel_name, _raw in channels.items():
            channel = Channel.model_validate(_raw)  # type: ignore[reportArgumentType]
            job = channel.job

            jobset = client.get_jobset(project=job.project, jobset=job.jobset)
            source = jobset.inputs[settings.HYDRA_INPUT_NAME]
            branch_name = source.get_branch(default=settings.TRACKING_BRANCH)

            # By pre-configuring the source location on our end, we're decoupling the routing (where to get the data) from the parameters (which piece of the data to get).
            # This slightly reduces our reliance on Hydra to be trustworthy:
            # Limit the blast radius of compromise to be denial of service for updates instead of silent poisoning of new data.
            assert str(settings.GIT_CLONE_URL).lower() == str(source.url).lower(), (
                f"Unexpected source URL: {source.url!r}, expected {settings.GIT_CLONE_URL!r}"
            )

            # FIXME(@fricklerhandwerk): Deduplicate the release branches beforehand.
            # Due to which channels are currently marked "primary" in practice, this bumps each release branch exactly once.
            # If something invalidates the heuristic, this will send unnecessary requests.
            if channel.variant == NixChannel.Variant.PRIMARY:
                commit_sha1 = get_head_sha1(source.url, branch_name)
                branch, _ = NixpkgsBranch.objects.update_or_create(
                    name=branch_name,
                    defaults={"head_sha1_commit": commit_sha1},
                )
            else:
                branch = NixpkgsBranch.objects.get(name=branch_name)

            latest_build = client.get_latest_build(
                project=job.project, jobset=job.jobset, job=job.name
            )
            evaluation = client.get_evaluation(latest_build.jobsetevals[0])
            eval_input = evaluation.jobsetevalinputs[settings.HYDRA_INPUT_NAME]
            assert (
                str(eval_input.uri).lower() == str(source.url).lower()
            ), (  # Sanity check
                f"Unexpected eval input URI: {eval_input.uri!r}, expected {source.url!r}"
            )
            commit = eval_input.revision

            ch, created = NixChannel.objects.update_or_create(
                channel_branch=channel_name,
                defaults={
                    "release_branch": branch,
                    "head_sha1_commit": commit,
                    "state": channel.status,
                    "variant": channel.variant,
                },
            )
            self.stdout.write(
                f"Channel {ch.channel_branch} ({ch.state}) {'created at' if created else 'updated to'} {branch.head_sha1_commit[:8]}"
            )
