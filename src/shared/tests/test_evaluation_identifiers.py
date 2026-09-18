import json

from shared.evaluation import (
    SyncBatchAttributeIngester,
    fixup_evaluated_attribute,
    parse_evaluation_result,
)
from shared.models.nix_evaluation import NixEvaluation


def test_identifiers_parsed_from_eval_meta() -> None:
    raw = {
        "attr": "hello.x86_64-linux",
        "attrPath": ["hello", "x86_64-linux"],
        "name": "hello-2.12.3",
        "drvPath": "/nix/store/fake-hello-2.12.3.drv",
        "system": "x86_64-linux",
        "outputs": {"out": "/nix/store/fake-hello"},
        "meta": {
            "description": "Program that produces a familiar, friendly greeting",
            "homepage": "https://www.gnu.org/software/hello/",
            "identifiers": {
                "cpeParts": {
                    "part": "a",
                    "vendor": "gnu",
                    "product": "hello",
                    "version": "2.12.3",
                    "update": "*",
                },
            },
            "maintainers": [],
            "license": [],
            "knownVulnerabilities": [],
        },
    }
    evaluated = fixup_evaluated_attribute(raw)
    assert evaluated.meta is not None
    assert evaluated.meta.identifiers is not None
    assert evaluated.meta.identifiers.cpe_parts is not None
    assert evaluated.meta.identifiers.cpe_parts.vendor == "gnu"
    assert evaluated.meta.identifiers.cpe_parts.product == "hello"


def test_identifiers_roundtrip_into_derivation_meta(
    evaluation: NixEvaluation,
) -> None:
    line = json.dumps(
        {
            "attr": "hello.x86_64-linux",
            "attr_path": ["hello", "x86_64-linux"],
            "name": "hello-2.12.3",
            "drvPath": "/nix/store/fake-hello-2.12.3.drv",
            "system": "x86_64-linux",
            "outputs": {"out": "/nix/store/fake-hello"},
            "meta": {
                "description": "GNU Hello",
                "homepage": "https://www.gnu.org/software/hello/",
                "available": True,
                "broken": False,
                "unfree": False,
                "unsupported": False,
                "insecure": False,
                "identifiers": {
                    "cpeParts": {
                        "vendor": "gnu",
                        "product": "hello",
                    },
                },
                "maintainers": [],
                "license": [],
                "knownVulnerabilities": [],
            },
        }
    )
    partial = parse_evaluation_result(line)
    assert partial.evaluation is not None

    ingester = SyncBatchAttributeIngester([partial.evaluation], evaluation)
    ingester.initialize()
    drvs = ingester.ingest()
    assert len(drvs) == 1
    meta = drvs[0].metadata
    assert meta is not None
    assert meta.cpe_vendor == "gnu"
    assert meta.cpe_product == "hello"


def test_product_without_vendor_is_stored(
    evaluation: NixEvaluation,
) -> None:
    line = json.dumps(
        {
            "attr": "hello.x86_64-linux",
            "attr_path": ["hello", "x86_64-linux"],
            "name": "hello-2.12.3",
            "drvPath": "/nix/store/fake-hello-product-only.drv",
            "system": "x86_64-linux",
            "outputs": {"out": "/nix/store/fake-hello"},
            "meta": {
                "description": "GNU Hello",
                "available": True,
                "broken": False,
                "unfree": False,
                "unsupported": False,
                "insecure": False,
                "identifiers": {
                    "cpeParts": {
                        "product": "hello",
                    },
                },
                "maintainers": [],
                "license": [],
                "knownVulnerabilities": [],
            },
        }
    )
    partial = parse_evaluation_result(line)
    assert partial.evaluation is not None

    ingester = SyncBatchAttributeIngester([partial.evaluation], evaluation)
    ingester.initialize()
    drvs = ingester.ingest()
    meta = drvs[0].metadata
    assert meta is not None
    assert meta.cpe_vendor is None
    assert meta.cpe_product == "hello"


def test_missing_identifiers_tolerated() -> None:
    raw = {
        "attr": "foo.x86_64-linux",
        "attrPath": ["foo", "x86_64-linux"],
        "name": "foo-1.0",
        "drvPath": "/nix/store/fake-foo.drv",
        "system": "x86_64-linux",
        "outputs": {"out": "/nix/store/fake-foo"},
        "meta": {
            "description": "No identifiers",
            "maintainers": [],
            "license": [],
            "knownVulnerabilities": [],
        },
    }
    evaluated = fixup_evaluated_attribute(raw)
    assert evaluated.meta is not None
    assert evaluated.meta.identifiers is None
