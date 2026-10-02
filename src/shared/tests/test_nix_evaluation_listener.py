from unittest.mock import patch

import pytest

from shared.listeners.nix_evaluation import run_evaluation_job
from shared.models.nix_evaluation import NixEvaluation


@pytest.mark.django_db
def test_run_evaluation_job_accepts_new_evaluation(
    evaluation: NixEvaluation,
) -> None:
    """Verify the listener can be invoked without errors."""
    with patch("shared.listeners.nix_evaluation.asyncio.run") as mock_run:
        run_evaluation_job(old=None, new=evaluation)

    mock_run.assert_called_once()
