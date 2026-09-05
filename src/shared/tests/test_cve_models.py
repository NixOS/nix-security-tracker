import pytest
from django.core.exceptions import ValidationError

from shared.models.cve import Cpe, Version, parse_version, validate_cpe


def test_version_constraint_str_less_equal() -> None:
    v = Version(less_equal="0.4.6")
    assert v.version_constraint_str() == "=<0.4.6"


def test_version_constraint_str_less_than() -> None:
    v = Version(less_than="1.0.0")
    assert v.version_constraint_str() == "<1.0.0"


def test_version_constraint_str_less_than_star() -> None:
    v = Version(less_than="*")
    assert v.version_constraint_str() == "*"


def test_version_constraint_str_exact_version() -> None:
    v = Version(version="1.2.3")
    assert v.version_constraint_str() == "==1.2.3"


def test_version_constraint_str_none() -> None:
    v = Version()
    assert v.version_constraint_str() is None


def test_version_affects_less_equal() -> None:
    v = Version(status=Version.Status.AFFECTED, less_equal="1.5.0")
    assert v.affects("1.4.0") == Version.Status.AFFECTED
    assert v.affects("1.5.0") == Version.Status.AFFECTED
    assert v.affects("1.6.0") == Version.Status.UNKNOWN


def test_version_affects_less_than() -> None:
    v = Version(status=Version.Status.AFFECTED, less_than="1.5.0")
    assert v.affects("1.4.0") == Version.Status.AFFECTED
    assert v.affects("1.5.0") == Version.Status.UNKNOWN


def test_version_affects_orders_numerically() -> None:
    # String comparison would order this wrong.
    v = Version(status=Version.Status.AFFECTED, less_than="1.10")
    assert v.affects("1.9") == Version.Status.AFFECTED


def test_version_affects_pre_releases() -> None:
    v = Version(status=Version.Status.AFFECTED, less_than="2.3")
    assert v.affects("2.3pre1") == Version.Status.AFFECTED
    assert v.affects("2.3alpha") == Version.Status.AFFECTED
    assert v.affects("2.3") == Version.Status.UNKNOWN


def test_version_affects_patch_suffixes() -> None:
    # OpenSSH and OpenSSL style suffixes are patch releases, not pre-releases.
    v = Version(status=Version.Status.AFFECTED, less_equal="9.8")
    assert v.affects("9.8p1") == Version.Status.UNKNOWN

    v = Version(status=Version.Status.AFFECTED, less_than="1.1.1w")
    assert v.affects("1.1.1") == Version.Status.AFFECTED
    assert v.affects("1.1.1w") == Version.Status.UNKNOWN


def test_version_affects_four_component_versions() -> None:
    # Chromium-family bounds are four-part and must compare in the last component.
    v = Version(status=Version.Status.AFFECTED, less_than="152.0.7977.82")
    assert v.affects("152.0.7977.60") == Version.Status.AFFECTED
    assert v.affects("152.0.7977.82") == Version.Status.UNKNOWN


def test_version_affects_numbered_suffixes() -> None:
    v = Version(status=Version.Status.AFFECTED, less_than="3.0.2-r10")
    assert v.affects("3.0.2-r2") == Version.Status.AFFECTED


def test_version_affects_v_prefix() -> None:
    v = Version(status=Version.Status.AFFECTED, less_than="v19.24.9")
    assert v.affects("1.2.0") == Version.Status.AFFECTED


def test_version_affects_unparsable_version() -> None:
    v = Version(status=Version.Status.AFFECTED, less_than="1.5.0")
    assert v.affects("not a version") == Version.Status.UNKNOWN

    v = Version(status=Version.Status.AFFECTED, less_than="not a version")
    assert v.affects("1.0.0") == Version.Status.UNKNOWN


def test_parse_version_strips_unstable_suffix() -> None:
    assert parse_version("1.2.3-unstable-2026-01-01") == parse_version("1.2.3")
    assert parse_version("0-unstable-2026-01-01") == parse_version("0")
    # A date-only unstable version carries no comparable version at all.
    assert parse_version("unstable-2026-01-01") is None


def test_parse_version_treats_underscore_as_separator() -> None:
    assert parse_version("0.8.0_3") == parse_version("0.8.0.3")


def test_parse_version_rejects_garbage() -> None:
    assert parse_version("not a version") is None
    assert parse_version("") is None


def test_version_affects_exact_version() -> None:
    v = Version(status=Version.Status.AFFECTED, version="1.5.0")
    assert v.affects("1.5.0") == Version.Status.AFFECTED
    assert v.affects("1.4.0") == Version.Status.UNKNOWN


def test_version_affects_wildcard() -> None:
    v_le = Version(status=Version.Status.AFFECTED, less_equal="*")
    assert v_le.affects("any-version") == Version.Status.AFFECTED

    v_lt = Version(status=Version.Status.AFFECTED, less_than="*")
    assert v_lt.affects("any-version") == Version.Status.AFFECTED

    v_v = Version(status=Version.Status.AFFECTED, version="*")
    assert v_v.affects("any-version") == Version.Status.AFFECTED


def test_version_affects_empty_version() -> None:
    v = Version(status=Version.Status.AFFECTED, version="1.0.0")
    assert v.affects("") == Version.Status.UNKNOWN
    assert v.affects(None) == Version.Status.UNKNOWN


def test_cpe_accepts_cpe23() -> None:
    validate_cpe("cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*")


def test_cpe_accepts_cpe22() -> None:
    validate_cpe("cpe:/a:vendor:product:1.0")


def test_cpe_rejects_invalid() -> None:
    with pytest.raises(ValidationError):
        Cpe(name="not-a-cpe").clean_fields()


def test_cpe_is_hardware() -> None:
    assert Cpe(name="cpe:2.3:h:acme:device:1.0:*:*:*:*:*:*:*").parsed.is_hardware()
