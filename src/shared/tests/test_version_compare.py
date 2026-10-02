"""
Tests for Nix-compatible version comparison and name normalization.

Validates that the version comparator handles the cases where Python's
native string comparison fails (the core bug in Version.affects()),
plus Nix-specific version ordering and CVE name matching patterns.
"""

import pytest

from shared.version_compare import (
    compare_versions,
    normalize_name,
    parse_cpe_product,
    version_equal,
    version_less_equal,
    version_less_than,
)


class TestCompareVersions:
    """Core version comparison — the cases that string ordering gets wrong."""

    @pytest.mark.parametrize(
        "lesser,greater",
        [
            # The fundamental bug: multi-digit numeric segments
            ("1.9", "1.10"),
            ("1.9.0", "1.10.0"),
            ("9.0.0", "10.0.0"),
            ("2.3.14", "2.3.100"),
            # Standard semver ordering
            ("1.0.0", "2.0.0"),
            ("1.0.0", "1.1.0"),
            ("1.0.0", "1.0.1"),
            ("0.9.9", "1.0.0"),
            # Nix-specific: "pre" is a non-numeric segment that extends the version.
            # Nix's compareVersions is purely mechanical — "2.3" < "2.3pre1"
            # because "" < "pre" (empty sorts before non-empty).
            # This differs from semver where "pre" means pre-release.
            ("2.3", "2.3pre1"),
            ("2.3pre1", "2.3pre2"),
            ("2.3pre1", "2.3.1"),
            # Mixed segment lengths
            ("1.0", "1.0.1"),
            ("1", "1.0.1"),
        ],
    )
    def test_less_than(self, lesser: str, greater: str) -> None:
        assert compare_versions(lesser, greater) == -1
        assert compare_versions(greater, lesser) == 1

    @pytest.mark.parametrize(
        "a,b",
        [
            ("1.0", "1.0"),
            ("1.0.0", "1.0.0"),
            ("2.3pre1", "2.3pre1"),
            ("10.0.0", "10.0.0"),
        ],
    )
    def test_equal(self, a: str, b: str) -> None:
        assert compare_versions(a, b) == 0

    def test_string_comparison_bug_regression(self) -> None:
        """
        Directly tests the bug documented in Version.affects() FIXME.
        String comparison: "1.9" > "1.10" (because "9" > "1").
        Correct:           "1.9" < "1.10" (because 9 < 10).
        """
        # This is wrong with Python string comparison
        assert "1.9" > "1.10"  # Python string comparison (WRONG)
        # This is correct with our comparator
        assert compare_versions("1.9", "1.10") == -1  # (CORRECT)

    def test_nix_version_ordering(self) -> None:
        """
        Nix's builtins.compareVersions is mechanical, not semantic.
        "2.3" < "2.3pre1" because empty string < "pre".
        This means "pre" does NOT mean "pre-release" in Nix ordering.
        """
        # "2.3" has fewer segments, empty string < "pre"
        assert compare_versions("2.3", "2.3pre1") == -1
        assert compare_versions("2.3pre1", "2.3") == 1


class TestVersionConstraints:
    """Test the constraint functions that will replace Version.affects()."""

    def test_less_than_true(self) -> None:
        assert version_less_than("2.28.0", "2.31.1") is True

    def test_less_than_false(self) -> None:
        assert version_less_than("2.32.0", "2.31.1") is False

    def test_less_than_equal_boundary(self) -> None:
        assert version_less_than("2.31.1", "2.31.1") is False
        assert version_less_equal("2.31.1", "2.31.1") is True

    def test_equal(self) -> None:
        assert version_equal("1.0.0", "1.0.0") is True
        assert version_equal("1.0.0", "1.0.1") is False

    def test_real_cve_scenario(self) -> None:
        """
        Simulates a real CVE check: CVE says affected < 2.31.1.
        Package version 2.28 is affected, 2.32 is not.
        """
        constraint = "2.31.1"
        assert version_less_than("2.28", constraint) is True  # affected
        assert version_less_than("2.32", constraint) is False  # not affected

    def test_openssl_versions(self) -> None:
        """OpenSSL uses versions like 1.1.1k, 3.0.8, 3.1.0."""
        assert version_less_than("1.1.1", "1.1.1k") is True
        assert version_less_than("3.0.8", "3.1.0") is True
        assert version_less_than("3.1.0", "3.0.8") is False


class TestNormalizeName:
    """Test derivation name normalization for CVE matching."""

    @pytest.mark.parametrize(
        "drv_name,expected",
        [
            # Python interpreter prefix stripping
            ("python3.11-requests", ["python3.11-requests", "requests"]),
            ("python3.12-urllib3", ["python3.12-urllib3", "urllib3"]),
            # Perl prefix
            ("perl5.38.2-XML-Parser", ["perl5.38.2-XML-Parser", "XML-Parser"]),
            # Ruby prefix
            ("ruby3.2-nokogiri", ["ruby3.2-nokogiri", "nokogiri"]),
            # No prefix — returns just the original
            ("openssl", ["openssl"]),
            ("tomcat", ["tomcat"]),
            ("libxml2", ["libxml2"]),
            # NodeJS prefix
            ("nodejs18-sharp", ["nodejs18-sharp", "sharp"]),
        ],
    )
    def test_normalize(self, drv_name: str, expected: list[str]) -> None:
        assert normalize_name(drv_name) == expected

    def test_original_always_included(self) -> None:
        """The original name is always the first candidate."""
        result = normalize_name("python3.11-requests")
        assert result[0] == "python3.11-requests"


class TestParseCpeProduct:
    """Test CPE string parsing for vendor/product extraction."""

    def test_standard_cpe(self) -> None:
        vendor, product = parse_cpe_product(
            "cpe:2.3:a:apache:tomcat:9.0.0:*:*:*:*:*:*:*"
        )
        assert vendor == "apache"
        assert product == "tomcat"

    def test_openssl_cpe(self) -> None:
        vendor, product = parse_cpe_product(
            "cpe:2.3:a:openssl:openssl:1.1.1:*:*:*:*:*:*:*"
        )
        assert vendor == "openssl"
        assert product == "openssl"

    def test_wildcard_vendor(self) -> None:
        vendor, product = parse_cpe_product(
            "cpe:2.3:a:*:curl:7.0:*:*:*:*:*:*:*"
        )
        assert vendor is None
        assert product == "curl"

    def test_invalid_cpe(self) -> None:
        assert parse_cpe_product("invalid") == (None, None)
        assert parse_cpe_product("") == (None, None)

    def test_hardware_cpe(self) -> None:
        """Hardware CPEs should still parse — filtering is done elsewhere."""
        vendor, product = parse_cpe_product(
            "cpe:2.3:h:cisco:some_router:1.0:*:*:*:*:*:*:*"
        )
        assert vendor == "cisco"
        assert product == "some_router"
