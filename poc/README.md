# PoC: Improved CVE-to-Nix Matching via Version Comparison & Name Normalization

## What this is

A proof-of-concept for [GSoC 2026 — Security Tracker Improvements](../gsoc-2026-implementation-plan.md).

The security tracker's automatic matching (`automatic_linkage.py`) links CVEs to
Nix packages using case-insensitive name matching (`icontains`). It ignores version
constraints entirely — meaning every matched package is flagged regardless of whether
its version is actually affected. The `Version.affects()` method exists but uses
Python string comparison, which is fundamentally broken (`"1.9" > "1.10"` as strings).

This PoC implements the two foundational pieces needed before any matching
improvement can work:

### 1. Nix-compatible version comparison (`src/shared/version_compare.py`)

Replaces string-based comparison with segment-by-segment ordering that follows
Nix's `builtins.compareVersions` semantics:
- Split on `.`, `-`, and digit/non-digit boundaries
- Numeric segments compare as integers (fixes `"1.9" > "1.10"`)
- Non-numeric segments compare lexicographically, sorting before numeric ones
- Shorter versions pad with empty strings

### 2. Name normalization for CVE matching

Nix derivations often have interpreter prefixes (`python3.11-requests`,
`perl5.38.2-XML-Parser`). CVEs list the bare product name (`requests`,
`XML-Parser`). `normalize_name()` strips these prefixes to produce candidate
names, reducing false negatives in matching.

### 3. CPE product extraction

Parses CPE 2.3 strings to extract vendor/product for structured matching against
derivation names, replacing the current approach that skips CPE data entirely.

## How these fit into the tracker

These utilities slot directly into `produce_linkage_candidates()` in
`src/shared/listeners/automatic_linkage.py`:

```
Current flow:   CVE → extract names → icontains query → done
Improved flow:  CVE → extract names + CPE products
                    → normalize derivation names (strip prefixes)
                    → match (name OR CPE product)
                    → filter by version constraints using compare_versions()
                    → annotate with confidence (VERSION_CONSTRAINT_INRANGE/OUTOFRANGE)
```

## Files

```
src/shared/version_compare.py           # Version comparison, name normalization, CPE parsing
src/shared/tests/test_version_compare.py # 39 tests covering edge cases and regressions
poc/README.md                            # This file
```

## Run locally

No Django or database needed — the PoC is pure Python with no external dependencies.

```bash
# Run the test suite (39 tests)
python3 -m pytest src/shared/tests/test_version_compare.py -v --noconftest

# Or with the Nix dev shell (if available)
nix-shell --run "pytest src/shared/tests/test_version_compare.py -v"
```

### Quick smoke test

```python
>>> from shared.version_compare import compare_versions, normalize_name, parse_cpe_product

# The core bug fix: string comparison gets this wrong
>>> "1.9" > "1.10"  # Python string comparison (WRONG)
True
>>> compare_versions("1.9", "1.10")  # Nix-compatible (CORRECT)
-1

# Name normalization for better matching
>>> normalize_name("python3.11-requests")
['python3.11-requests', 'requests']

# CPE parsing for structured matching
>>> parse_cpe_product("cpe:2.3:a:apache:tomcat:9.0.0:*:*:*:*:*:*:*")
('apache', 'tomcat')
```
