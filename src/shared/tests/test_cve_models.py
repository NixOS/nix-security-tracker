from shared.models.cve import Version


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
