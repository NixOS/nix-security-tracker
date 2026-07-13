"""Serve aggregated prometheus_client multiprocess metrics for the evaluator."""

from __future__ import annotations

import time
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from shared.metrics import serve_multiprocess_metrics


class Command(BaseCommand):
    help = (
        "Serve Prometheus /metrics from PROMETHEUS_MULTIPROC_DIR "
        "(evaluator metrics sidecar)."
    )

    def handle(self, *args: Any, **options: Any) -> None:
        port = settings.METRICS_HTTP_PORT
        if port is None:
            raise CommandError("METRICS_HTTP_PORT must be set to serve worker metrics")

        serve_multiprocess_metrics(port)
        self.stdout.write(
            self.style.SUCCESS(f"Serving multiprocess metrics on port {port}")
        )
        while True:
            time.sleep(3600)
