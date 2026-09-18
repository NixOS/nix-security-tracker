"""
Remove locally imported matching training-data from the database.
"""

from __future__ import annotations

from django.db import transaction

from shared.matching_training_data.serializers import (
    _TRAINING_ORG_UUID,
    BENCHMARK_CHANNEL_BRANCH,
)
from shared.models.cve import CveRecord
from shared.models.nix_evaluation import NixDerivation


@transaction.atomic
def purge_training_corpus() -> dict[str, int]:
    """
    Delete training-org CVEs and synthetic benchmark-channel derivations.

    CVEs are removed first so proposal links do not block derivation cleanup.
    The training organization and benchmark channel/evaluation rows are kept.
    """
    totals: dict[str, int] = {}

    _, cve_details = CveRecord.objects.filter(
        assigner__uuid=_TRAINING_ORG_UUID
    ).delete()
    for label, count in cve_details.items():
        totals[label] = totals.get(label, 0) + count

    _, drv_details = NixDerivation.objects.filter(
        parent_evaluation__channel__channel_branch=BENCHMARK_CHANNEL_BRANCH
    ).delete()
    for label, count in drv_details.items():
        totals[label] = totals.get(label, 0) + count

    return totals
