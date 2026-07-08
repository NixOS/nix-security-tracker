from unittest.mock import Mock, patch

import pytest

from shared.management.commands.fetch_all_channels import fetch_from_monitoring


def monitoring_response(name: str, revision: str, status: str) -> Mock:
    resp = Mock()
    resp.json.return_value = {
        "data": {
            "result": [
                {
                    "metric": {
                        "channel": name,
                        "revision": revision,
                        "status": status,
                    }
                }
            ]
        }
    }
    return resp


@pytest.mark.parametrize(
    "name,name_valid",
    [
        ("nixos-25.05", True),
        ("nixos-unstable", True),
        ("nixos", False),
        ("NixOS-25.05", False),
        ("--evil", False),
        ("", False),
    ],
)
@pytest.mark.parametrize(
    "revision,revision_valid",
    [
        ("a" * 40, True),
        ("abc123", False),
        ("z" * 40, False),
        ("--upload-pack=evil" + "a" * 21, False),
        ("", False),
    ],
)
@pytest.mark.parametrize(
    "status,status_valid",
    [
        ("stable", True),
        ("rolling", True),
        ("STABLE", False),
        ("1", False),
        ("", False),
    ],
)
def test_input_validation(
    name: str,
    name_valid: bool,
    revision: str,
    revision_valid: bool,
    status: str,
    status_valid: bool,
) -> None:
    with patch(
        "requests.get", return_value=monitoring_response(name, revision, status)
    ):
        if name_valid and revision_valid and status_valid:
            [channel] = fetch_from_monitoring()
            assert channel.channel == name
            assert channel.revision == revision
            assert channel.status == status
        else:
            with pytest.raises(Exception):
                fetch_from_monitoring()
