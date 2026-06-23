from collections.abc import Callable
from datetime import timedelta

from shared.models.nix_evaluation import NixEvaluation


def test_latest_per_channel_selects_by_updated_at(
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    older = make_evaluation(
        state=NixEvaluation.EvaluationState.COMPLETED,
        commit_sha1="older-eval",
        age=timedelta(days=2),
    )
    newer = make_evaluation(
        state=NixEvaluation.EvaluationState.CRASHED,
        commit_sha1="newer-eval",
        age=timedelta(days=0),
    )

    latest = NixEvaluation.objects.latest_per_channel().get()

    assert latest == newer
    assert latest != older
