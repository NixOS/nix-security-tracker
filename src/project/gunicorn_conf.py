"""
Gunicorn hooks, loaded with `gunicorn -c python:project.gunicorn_conf`.

With several worker processes, `prometheus_client` needs `PROMETHEUS_MULTIPROC_DIR`
so that `/metrics` reports the sum over all workers instead of whichever one answered.
https://prometheus.github.io/client_python/multiprocess/
"""

import os
import shutil
from pathlib import Path

from gunicorn.arbiter import Arbiter
from gunicorn.workers.base import Worker
from prometheus_client import multiprocess


def on_starting(server: Arbiter) -> None:
    # The directory must start out empty, or stale values from a previous run are summed in.
    if directory := os.environ.get("PROMETHEUS_MULTIPROC_DIR"):
        shutil.rmtree(directory, ignore_errors=True)
        Path(directory).mkdir(parents=True)


def child_exit(server: Arbiter, worker: Worker) -> None:
    if os.environ.get("PROMETHEUS_MULTIPROC_DIR"):
        multiprocess.mark_process_dead(worker.pid)
