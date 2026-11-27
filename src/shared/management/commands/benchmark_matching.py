"""
Offline matching quality vs curated training-data labels.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from pprint import pformat
from typing import Any

from django.core.management.base import BaseCommand

from shared.matching_training_data.benchmark import (
    BenchmarkReport,
    aggregate,
    rematch,
    sample_corpus,
    score_proposal,
    tally_matches,
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
            help="Sample at most N curated suggestions, the same ones on every run.",
        )
        parser.add_argument(
            "--algorithm-version",
            type=int,
            default=None,
            help="Score only suggestions made by this algorithm version.",
        )
        parser.add_argument(
            "--quiet",
            action="store_true",
            help="Suppress per-CVE ProposalScore lines (summary only).",
        )
        parser.add_argument(
            "--tally-only",
            action="store_true",
            help="Tally the curated matches without running the matcher.",
        )
        parser.add_argument(
            "--output",
            type=Path,
            default=None,
            help="Write output to this JSON file.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        limit: int | None = options["limit"]
        quiet: bool = options["quiet"]
        output: Path | None = options["output"]
        algorithm_version: int | None = options["algorithm_version"]

        self.stderr.write("Querying curated matching data...")
        qs = training_corpus_queryset()
        if algorithm_version is not None:
            qs = qs.filter(algorithm_version=algorithm_version)
        if limit is not None:
            qs = sample_corpus(qs, limit)

        if options["tally_only"]:
            tallies = tally_matches(qs)
            if output is None:
                self.stdout.write(tallies.model_dump_json(indent=2))
                return
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(
                tallies.model_dump_json(indent=2) + "\n", encoding="utf-8"
            )
            self.stdout.write(f"Wrote match tallies to {output}")
            return

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
            if algorithm_version is not None:
                warning = f"No training data for algorithm version {algorithm_version}."
            else:
                warning = (
                    "No training-data proposals found on the benchmark corpus. "
                    "Import with manage import_matching_training_data first."
                )
            self.stdout.write(self.style.WARNING(warning))
            return

        self.stdout.write(self.style.SUCCESS(pformat(report)))
        if output is None:
            return

        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(
            BenchmarkReport(aggregate=report, scores=scores).model_dump_json() + "\n",
            encoding="utf-8",
        )
        self.stdout.write(f"Wrote benchmark report to {output}")
