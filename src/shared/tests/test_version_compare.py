"""
Tests for the Python port of Nix's `builtins.compareVersions`.

Known-answer tests cover cases where string comparison or semver intuition give the wrong result.
A parity test additionally checks the port against the reference implementation, by evaluating `builtins.compareVersions` via `nix-instantiate` on a corpus of version pairs.
Shelling out to Nix is acceptable as a test oracle, but application code must never do it.
"""

import itertools
import json
import shutil
import subprocess

import pytest

from shared.version_compare import compare_versions


@pytest.mark.parametrize(
    ("older", "newer"),
    [
        # Numeric components compare as integers, not strings.
        ("1.9", "1.10"),
        ("2.3.14", "2.3.100"),
        # Ordinary ordering.
        ("1.0.0", "2.0.0"),
        ("1.0.0", "1.0.1"),
        ("0.9.9", "1.0.0"),
        ("1.0", "1.0.1"),
        # `pre` sorts before everything: 2.3pre1 is a pre-release of 2.3.
        ("2.3pre1", "2.3"),
        ("2.3pre1", "2.3.1"),
        ("2.3pre1", "2.3pre2"),
        ("2.3pre1", "2.3a"),
        # Other non-numeric components extend the version instead.
        ("2.3", "2.3a"),
        ("2.3a", "2.3.1"),
        ("2.3a", "2.3b"),
        ("1.1.1", "1.1.1k"),
        # Digit runs overflowing a C integer compare as strings, which sort before any numeric component.
        ("2147483648", "2147483647"),
        ("2147483648", "0"),
    ],
)
def test_ordering(older: str, newer: str) -> None:
    assert compare_versions(older, newer) == -1
    assert compare_versions(newer, older) == 1


@pytest.mark.parametrize(
    ("v1", "v2"),
    [
        ("1.0", "1.0"),
        # `.` and `-` are interchangeable separators.
        ("1.0", "1-0"),
        ("2.3pre1", "2.3-pre.1"),
        # Numeric comparison ignores leading zeros.
        ("1.007", "1.7"),
        # Trailing separators are not components.
        ("1.0", "1.0."),
    ],
)
def test_equivalent(v1: str, v2: str) -> None:
    assert compare_versions(v1, v2) == 0


# Chosen to exercise every branch of the comparison.
# Numbers, leading zeros, the integer overflow boundary, `pre` in various positions, non-numeric components, separator runs, and empty or all-separator inputs.
_CORPUS = [
    "",
    ".",
    "-",
    "1",
    "007",
    "1.0",
    "1.0.0",
    "1-0",
    "1.0.1",
    "1.9",
    "1.10",
    "1.1.1k",
    "2.3",
    "2.3.1",
    "2.3a",
    "2.3b",
    "2.3pre",
    "2.3pre1",
    "2.3.pre1",
    "2.3-pre.1",
    "2.3preX",
    "pre",
    "pre1",
    "a",
    "abc",
    "openssl",
    "2147483647",
    "2147483648",
    "9223372036854775808",
    "1.2147483648",
    "1.2147483648.0",
    "0.0.0",
    "10.0.0",
    "1..2",
    "1.-2",
    "1.0rc1",
    "1.0.rc1",
    "unstable-2024-01-01",
    "0-unstable-2024-01-01",
]


@pytest.mark.skipif(
    shutil.which("nix-instantiate") is None,
    reason="nix-instantiate is not available",
)
def test_parity_with_nix() -> None:
    pairs = list(itertools.product(_CORPUS, repeat=2))
    expr = (
        "{pairs}: map"
        " (p: builtins.compareVersions (builtins.elemAt p 0) (builtins.elemAt p 1))"
        " (builtins.fromJSON pairs)"
    )
    result = subprocess.run(
        [
            "nix-instantiate",
            "--eval",
            "--strict",
            "--json",
            "--expr",
            expr,
            "--argstr",
            "pairs",
            json.dumps(pairs),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    expected = json.loads(result.stdout)

    mismatches = [
        (v1, v2, ours, nixs)
        for (v1, v2), nixs in zip(pairs, expected, strict=True)
        if (ours := compare_versions(v1, v2)) != nixs
    ]
    assert mismatches == []
