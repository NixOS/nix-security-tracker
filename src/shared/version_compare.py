"""
Port of Nix's `builtins.compareVersions`.
https://nix.dev/manual/nix/latest/language/builtins.html#builtins-compareVersions

Reproduces the reference implementation exactly, quirks included:
https://github.com/NixOS/nix/blob/master/src/libstore/names.cc
The test suite checks parity with `nix-instantiate` on the same inputs.
"""

from itertools import zip_longest

_SEPARATORS = ".-"

# Nix parses numeric components as C integers, so larger values compare as strings.
_INT_MAX = 2**31 - 1


def _is_digit(char: str) -> bool:
    # Nix only considers ASCII characters digits, Python is more lenient.
    return "0" <= char <= "9"


def _parse_int(component: str) -> int | None:
    if not component or not all(_is_digit(char) for char in component):
        return None
    value = int(component)
    return value if value <= _INT_MAX else None


def _components(version: str) -> list[str]:
    """
    Split a version string into maximal runs of digits or non-digits.
    Dots and dashes are separators and belong to no component.
    """
    components = []
    pos = 0
    end = len(version)
    while pos < end:
        while pos < end and version[pos] in _SEPARATORS:
            pos += 1
        if pos == end:
            break
        start = pos
        if _is_digit(version[pos]):
            while pos < end and _is_digit(version[pos]):
                pos += 1
        else:
            while (
                pos < end
                and not _is_digit(version[pos])
                and version[pos] not in _SEPARATORS
            ):
                pos += 1
        components.append(version[start:pos])
    return components


def _components_lt(c1: str, c2: str) -> bool:
    n1 = _parse_int(c1)
    n2 = _parse_int(c2)

    if n1 is not None and n2 is not None:
        return n1 < n2
    elif c1 == "" and n2 is not None:
        return True
    elif c1 == "pre" and c2 != "pre":
        return True
    elif c2 == "pre":
        return False
    # Assume that `2.3a` < `2.3.1`.
    elif n2 is not None:
        return True
    elif n1 is not None:
        return False
    else:
        return c1 < c2


def compare_versions(v1: str, v2: str) -> int:
    """
    Compare two version strings as `builtins.compareVersions` does.
    Returns -1 if the first is older, 0 if equivalent, 1 if newer.
    """
    for c1, c2 in zip_longest(_components(v1), _components(v2), fillvalue=""):
        if _components_lt(c1, c2):
            return -1
        if _components_lt(c2, c1):
            return 1
    return 0
