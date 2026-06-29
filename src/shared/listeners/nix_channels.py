import logging

import pgpubsub

from shared.channels import NixpkgsBranchInsertChannel, NixpkgsBranchUpdateChannel
from shared.models import NixEvaluation
from shared.models.nix_evaluation import NixpkgsBranch

logger = logging.getLogger(__name__)


def enqueue_evaluation_job(branch: NixpkgsBranch) -> tuple[NixEvaluation, bool]:
    eval_job, created = NixEvaluation.objects.get_or_create(
        defaults={
            # We will leave the scheduling to the evaluation channel
            # listener.
            "state": NixEvaluation.EvaluationState.WAITING
        },
        branch=branch,
        commit_sha1=branch.head_sha1_commit,
    )
    # If the commit is shared by multiple channels, prefer the tracking branch.
    if (
        not created
        and branch.is_tracking_branch
        and not eval_job.branch.is_tracking_branch
    ):
        eval_job.branch = branch
        eval_job.save(update_fields=["branch", "updated_at"])

    logger.info(
        f"Enqueued evaluation job {eval_job}{' (already existing!)' if not created else ''}"
    )
    return eval_job, created


@pgpubsub.post_insert_listener(NixpkgsBranchInsertChannel)
def start_evaluation_jobs_upon_insertion(
    old: NixpkgsBranch, new: NixpkgsBranch
) -> None:
    logger.info("Nixpkgs branch created: %s at %s", new.name, new.head_sha1_commit)
    branch = NixpkgsBranch.objects.get(pk=new.name)
    if branch.is_tracked:
        enqueue_evaluation_job(branch)


# XXX(@fricklerhandwerk): We can't reuse the same channel for different events
# https://github.com/PaulGilmartin/django-pgpubsub/issues/86
@pgpubsub.post_update_listener(NixpkgsBranchUpdateChannel)
def start_evaluation_jobs_upon_updates(old: NixpkgsBranch, new: NixpkgsBranch) -> None:
    logger.info(
        "Nixpkgs branch updated: %s %s -> %s",
        new.name,
        old.head_sha1_commit,
        new.head_sha1_commit,
    )
    if old.head_sha1_commit != new.head_sha1_commit:
        branch = NixpkgsBranch.objects.get(pk=new.name)
        if branch.is_tracked:
            enqueue_evaluation_job(branch)
