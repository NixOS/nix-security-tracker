"""
Offline matching quality vs curated training-data labels.
"""

from __future__ import annotations

import argparse
from pprint import pformat
from typing import Any

from django.core.management.base import BaseCommand

from shared.matching_training_data.benchmark import (
    aggregate,
    rematch,
    score_proposal,
    training_corpus_queryset,
)


def _positive_int(value: str) -> int:
    parsed = int(value)
    if parsed < 1:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return parsed


class Command(BaseCommand):
    help = (
        "Score current matching algorithm against curated training data. "
        "Read-only: does not create proposals."
    )

    def add_arguments(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument(
            "--limit",
            type=_positive_int,
            default=None,
            help="Score at most N training proposals (for smoke tests).",
        )
        parser.add_argument(
            "--quiet",
            action="store_true",
            help="Suppress per-CVE ProposalScore lines (summary only).",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        limit: int | None = options["limit"]
        quiet: bool = options["quiet"]

        self.stdout.write("Querying curated matching data...")
        qs = training_corpus_queryset()
        if limit is not None:
            qs = qs[:limit]

        scores = []
        for i, original in enumerate(qs, start=1):
            new_match = rematch(original)
            score = score_proposal(original, new_match)
            scores.append(score)
            if not quiet:
                self.stdout.write(pformat(score))
            if i % 100 == 0:
                self.stdout.write(f"Scored {i} proposals…")

        report = aggregate(scores)
        if report.proposals == 0:
            self.stdout.write(
                self.style.WARNING(
                    "No training-data proposals found on the benchmark corpus. "
                    "Import with manage import_matching_training_data first."
                )
            )
            return

        self.stdout.write(self.style.SUCCESS(pformat(report)))
