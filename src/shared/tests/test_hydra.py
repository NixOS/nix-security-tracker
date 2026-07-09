import json
from pathlib import Path

import pytest
from pydantic import BaseModel

from shared.hydra import Build, Evaluation, Jobset

"""
To refresh fixtures, run from repository root:

hydra() { curl -sLH 'Accept: application/json' "https://hydra.nixos.org/$1" | jq --sort-keys; }
hydra jobset/nixos/unstable-small \
  > src/shared/tests/hydra_fixtures/jobset.json

hydra job/nixos/unstable-small/tested/latest \
  > src/shared/tests/hydra_fixtures/build.json

eval=$(jq .jobsetevals[0] src/shared/tests/hydra_fixtures/build.json)
hydra eval/$eval \
  > src/shared/tests/hydra_fixtures/evaluation.json
"""

# FIXME(@fricklerhandwerk): Update these on each dependency bump automatically, so we don't silently go out of sync if changes happen.
fixtures = Path(__file__).parent / "hydra_fixtures"

jobset = json.loads((fixtures / "jobset.json").read_text())

build = json.loads((fixtures / "build.json").read_text())

evaluation = json.loads((fixtures / "evaluation.json").read_text())


@pytest.mark.parametrize(
    ("model", "data"),
    [
        (Jobset, jobset),
        (Build, build),
        (Evaluation, evaluation),
    ],
)
def test_hydra_output_parsing(model: type[BaseModel], data: dict) -> None:
    model.model_validate(data)


def test_jobset_filters_non_git_inputs() -> None:
    assert any(v["type"] != "git" for v in jobset["inputs"].values())
    parsed = Jobset.model_validate(jobset)
    assert set(parsed.inputs.keys()) == {
        k for k, v in jobset["inputs"].items() if v["type"] == "git"
    }


def test_jobset_input_url_without_branch() -> None:
    parsed = Jobset.model_validate(
        {
            "inputs": {
                "nixpkgs": {
                    "type": "git",
                    "value": "https://github.com/NixOS/nixpkgs.git",
                    "emailresponsible": False,
                    "name": "nixpkgs",
                }
            }
        }
    )
    assert parsed.inputs["nixpkgs"].branch is None
    assert parsed.inputs["nixpkgs"].get_branch(default="foo") == "foo"


def test_jobset_input_url_with_branch() -> None:
    parsed = Jobset.model_validate(
        {
            "inputs": {
                "nixpkgs": {
                    "type": "git",
                    "value": "https://github.com/NixOS/nixpkgs.git release-25.11",
                    "emailresponsible": False,
                    "name": "nixpkgs",
                }
            }
        }
    )
    assert parsed.inputs["nixpkgs"].branch == "release-25.11"
    assert parsed.inputs["nixpkgs"].get_branch(default="master") == "release-25.11"


def test_evaluation_filters_non_git_inputs() -> None:
    assert any(v["type"] != "git" for v in evaluation["jobsetevalinputs"].values())
    parsed = Evaluation.model_validate(evaluation)
    assert set(parsed.jobsetevalinputs.keys()) == {
        k for k, v in evaluation["jobsetevalinputs"].items() if v["type"] == "git"
    }
