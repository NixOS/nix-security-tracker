import requests
from django.conf import settings
from pydantic import BaseModel, ConfigDict


class JobsetInput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    value: str


class Jobset(BaseModel):
    model_config = ConfigDict(extra="ignore")

    inputs: dict[str, JobsetInput]

    def input_branch(self, input_name: str, default: str) -> str:
        """
        Get the branch tracked by the named jobset input.
        Use `default` when the input value specifies no explicit branch.

        Raises `KeyError` when the input is absent.
        """
        parts = self.inputs[input_name].value.split()
        return parts[1] if len(parts) > 1 else default


def jobset_from_job(job: str) -> str:
    """
    Extract jobset path from a full job path.

    Example: `"nixos/release-26.05/tested"` → `"nixos/release-26.05"`.
    """
    return "/".join(job.split("/")[:-1])


class HydraClient:
    """
    Minimal client for the Hydra API.
    """

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    def get_jobset(self, jobset_path: str) -> Jobset:
        """
        Fetches jobset metadata for the given `<project>/<jobset>` path.
        """
        resp = requests.get(
            f"{self.base_url}/jobset/{jobset_path}",
            headers={"Accept": "application/json"},
            timeout=settings.NETWORK_REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return Jobset.model_validate(resp.json())


def default_client() -> HydraClient:
    return HydraClient(str(settings.HYDRA_URL))
