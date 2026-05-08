import pytest

from shared.cache_suggestions import parse_drv_name


@pytest.mark.parametrize(
    "drv_name,expected",
    [
        ("openssl-3.0.8", ("openssl", "3.0.8")),
        ("libfoo-bar-1.2.3", ("libfoo-bar", "1.2.3")),
        ("foo-1.0-beta", ("foo", "1.0-beta")),
        ("foo-unstable", ("foo-unstable", "")),
        ("python3-3.11.0", ("python3", "3.11.0")),
        ("no-version", ("no-version", "")),
    ],
)
def test_parse_drv_name(drv_name: str, expected: tuple[str, str]) -> None:
    assert parse_drv_name(drv_name) == expected
