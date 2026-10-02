"""
Version comparison utilities for CVE-to-Nix-package matching.

Replaces the broken string-based comparison in Version.affects() with
proper version ordering that follows Nix's builtins.compareVersions semantics:

  1. Split the version string into segments at '.' and '-' boundaries,
     and at transitions between digit and non-digit characters.
  2. Compare segments pairwise:
     - If both segments are numeric, compare as integers.
     - Otherwise, compare lexicographically, with the empty string
       sorting *before* any non-empty string.
  3. A shorter version is padded with empty-string segments.

This handles semver, Nix-style versions (e.g. "2.3pre1"), and most
real-world version strings correctly — unlike Python's native string
comparison where "1.9" > "1.10" and "10.0" < "9.0".

Reference: https://nix.dev/manual/nix/latest/language/builtins.html#builtins-compareVersions
"""

import re


def _split_version(version: str) -> list[str]:
    """
    Split a version string into comparable segments.

    Splits on '.', '-', and at digit/non-digit boundaries.
    This mirrors Nix's internal version tokenization.

    >>> _split_version("1.10.3")
    ['1', '10', '3']
    >>> _split_version("2.3pre1")
    ['2', '3', 'pre', '1']
    >>> _split_version("1.0a1")
    ['1', '0', 'a', '1']
    >>> _split_version("python3.11-requests-2.31.0")
    ['python', '3', '11', 'requests', '2', '31', '0']
    """
    # First split on '.' and '-'
    parts = re.split(r"[.\-]", version)
    # Then split each part at digit/non-digit boundaries
    segments: list[str] = []
    for part in parts:
        segments.extend(re.findall(r"[0-9]+|[a-zA-Z]+", part))
    return segments


def _compare_segment(a: str, b: str) -> int:
    """
    Compare two version segments following Nix semantics.

    - Empty string sorts before any non-empty string.
    - Two numeric segments compare as integers.
    - Otherwise, lexicographic comparison.

    Returns -1, 0, or 1.
    """
    if a == b:
        return 0
    if a == "":
        return -1
    if b == "":
        return 1

    a_is_num = a.isdigit()
    b_is_num = b.isdigit()

    if a_is_num and b_is_num:
        ia, ib = int(a), int(b)
        return -1 if ia < ib else (1 if ia > ib else 0)

    # Nix: numeric segments sort after non-numeric
    if a_is_num != b_is_num:
        return 1 if a_is_num else -1

    # Both non-numeric: lexicographic
    return -1 if a < b else 1


def compare_versions(a: str, b: str) -> int:
    """
    Compare two version strings using Nix-compatible ordering.

    Returns:
        -1 if a < b
         0 if a == b
         1 if a > b

    Examples that break with naive string comparison but work here:

    >>> compare_versions("1.9", "1.10")
    -1
    >>> compare_versions("10.0.0", "9.0.0")
    1
    >>> compare_versions("2.3pre1", "2.3")
    1
    >>> compare_versions("1.0", "1.0")
    0
    """
    segs_a = _split_version(a)
    segs_b = _split_version(b)

    max_len = max(len(segs_a), len(segs_b))
    for i in range(max_len):
        sa = segs_a[i] if i < len(segs_a) else ""
        sb = segs_b[i] if i < len(segs_b) else ""
        result = _compare_segment(sa, sb)
        if result != 0:
            return result
    return 0


def version_less_than(version: str, constraint: str) -> bool:
    """Check if version < constraint using Nix-compatible ordering."""
    return compare_versions(version, constraint) < 0


def version_less_equal(version: str, constraint: str) -> bool:
    """Check if version <= constraint using Nix-compatible ordering."""
    return compare_versions(version, constraint) <= 0


def version_equal(version: str, constraint: str) -> bool:
    """Check if version == constraint using Nix-compatible ordering."""
    return compare_versions(version, constraint) == 0


# --- Name normalization for CVE-to-Nix matching ---

# Common interpreter/runtime prefixes in nixpkgs derivation names.
# Pattern: "python3.11-requests" -> "requests", "perl5.38.2-XML-Parser" -> "XML-Parser"
_INTERPRETER_PREFIX_RE = re.compile(
    r"^(?:"
    r"python\d[\d.]*"
    r"|perl\d[\d.]*"
    r"|ruby\d[\d.]*"
    r"|nodejs[\d.]*"
    r"|php\d[\d.]*"
    r"|lua\d[\d.]*"
    r"|haskell[\d.]*"
    r"|ocaml\d[\d.]*"
    r"|go\d[\d.]*"
    r"|rust\d[\d.]*"
    r")-",
    re.IGNORECASE,
)


def normalize_name(drv_name: str) -> list[str]:
    """
    Produce candidate names for matching a Nix derivation against CVE products.

    A derivation named "python3.11-requests" should match a CVE listing
    product "requests". This function returns the original name plus any
    stripped variants.

    Returns a list of candidate names (always includes the original).

    >>> normalize_name("python3.11-requests")
    ['python3.11-requests', 'requests']
    >>> normalize_name("openssl")
    ['openssl']
    >>> normalize_name("perl5.38.2-XML-Parser")
    ['perl5.38.2-XML-Parser', 'XML-Parser']
    """
    candidates = [drv_name]
    stripped = _INTERPRETER_PREFIX_RE.sub("", drv_name)
    if stripped != drv_name:
        candidates.append(stripped)
    return candidates


def parse_cpe_product(cpe_string: str) -> tuple[str | None, str | None]:
    """
    Extract vendor and product from a CPE 2.3 string.

    CPE format: cpe:2.3:part:vendor:product:version:...
    Example: cpe:2.3:a:apache:tomcat:9.0.0:*:*:*:*:*:*:*

    Returns (vendor, product) or (None, None) if unparseable.

    >>> parse_cpe_product("cpe:2.3:a:apache:tomcat:9.0.0:*:*:*:*:*:*:*")
    ('apache', 'tomcat')
    >>> parse_cpe_product("cpe:2.3:a:openssl:openssl:1.1.1:*:*:*:*:*:*:*")
    ('openssl', 'openssl')
    >>> parse_cpe_product("invalid")
    (None, None)
    """
    parts = cpe_string.split(":")
    if len(parts) >= 5 and parts[0] == "cpe" and parts[1] == "2.3":
        vendor = parts[3] if parts[3] != "*" else None
        product = parts[4] if parts[4] != "*" else None
        return vendor, product
    return None, None
