from typing import Annotated

import requests
from django.conf import settings
from pydantic import (
    AnyUrl,
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)

r"""
The following regular expressions were obtained like this:

nix develop github:NixOS/hydra --command perl -I subprojects/hydra/lib -MJSON -MHydra::Helper::CatalystUtils -e '
  my @names = qw(projectNameRE jobsetNameRE jobNameRE inputNameRE);
  no strict "refs";
  my %re = map { $_ => ${"Hydra::Helper::CatalystUtils::$_"} } @names;
  print encode_json(\%re);
'
"""
# FIXME(@fricklerhandwerk): Evaluate the Perl source at build time to get these without hard-coding.
project_name = r"(?:[A-Za-z_][A-Za-z0-9-_]*)"
jobset_name = r"(?:[A-Za-z_][A-Za-z0-9-_.]*)"
job_name = r"(?:(?:[A-Za-z_][A-Za-z0-9-_]*)(?:\.(?:[A-Za-z_][A-Za-z0-9-_]*))*)"
input_name = r"(?:[A-Za-z_][A-Za-z0-9-_]*)"

ProjectName = Annotated[str, Field(pattern=project_name)]
JobsetName = Annotated[str, Field(pattern=jobset_name)]
JobName = Annotated[str, Field(pattern=job_name)]
InputName = Annotated[str, Field(pattern=input_name)]

GitHash = Annotated[str, Field(pattern="[0-9a-f]{40}")]


class JobsetInput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    url: AnyUrl
    branch: JobsetName | None

    @model_validator(mode="before")
    @classmethod
    def parse_string(cls, data: dict) -> dict:
        parts = data["value"].split(None, 1)
        return {"url": parts[0], "branch": parts[1] if len(parts) > 1 else None}

    def get_branch(self, default: str) -> str:
        return self.branch if self.branch else default


class Jobset(BaseModel):
    model_config = ConfigDict(extra="ignore")

    inputs: dict[str, JobsetInput]

    @model_validator(mode="before")
    @classmethod
    def filter_git(cls, data: dict) -> dict:
        return {
            **data,
            "inputs": {
                k: v for k, v in data["inputs"].items() if v.get("type") == "git"
            },
        }


class EvalInput(BaseModel):
    uri: AnyUrl
    revision: GitHash


class Evaluation(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    jobsetevalinputs: dict[InputName, EvalInput]

    @model_validator(mode="before")
    @classmethod
    def filter_git(cls, data: dict) -> dict:
        return {
            **data,
            "jobsetevalinputs": {
                k: v
                for k, v in data["jobsetevalinputs"].items()
                if v.get("type") == "git"
            },
        }


class Build(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    jobsetevals: Annotated[list[int], Field(min_length=1)]


class HydraClient:
    """
    Minimal client for the Hydra API.
    """

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    def get_jobset(self, project: ProjectName, jobset: JobsetName) -> Jobset:
        resp = requests.get(
            f"{self.base_url}/jobset/{project}/{jobset}",
            headers={"Accept": "application/json"},
            timeout=settings.NETWORK_REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return Jobset.model_validate(resp.json())

    def get_latest_build(
        self, project: ProjectName, jobset: JobsetName, job: JobName
    ) -> Build:
        resp = requests.get(
            f"{self.base_url}/job/{project}/{jobset}/{job}/latest",
            headers={"Accept": "application/json"},
            timeout=settings.NETWORK_REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return Build.model_validate(resp.json())

    def get_evaluation(self, evaluation: int) -> Evaluation:
        resp = requests.get(
            f"{self.base_url}/eval/{evaluation}",
            headers={"Accept": "application/json"},
            timeout=settings.NETWORK_REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return Evaluation.model_validate(resp.json())


def default_client() -> HydraClient:
    return HydraClient(str(settings.HYDRA_URL))
