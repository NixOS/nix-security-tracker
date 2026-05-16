from collections.abc import Callable
from typing import Any

import pytest
from django.contrib.auth.models import User

from shared.auth.utils import ismaintainer
from shared.models.nix_evaluation import NixChannel


@pytest.mark.django_db
@pytest.mark.parametrize(("at_tip", "expected"), [(True, True), (False, False)])
def test_ismaintainer_respects_channel_tip(
    at_tip: bool,
    expected: bool,
    user: User,
    channel: NixChannel,
    make_evaluation: Callable[..., Any],
    make_drv: Callable[..., Any],
    make_maintainer_from_user: Callable[..., Any],
) -> None:
    evaluation = make_evaluation(
        channel=channel,
        commit_sha1=channel.head_sha1_commit if at_tip else None,  # otherwise random
    )
    make_drv(evaluation=evaluation, maintainer=make_maintainer_from_user(user))
    assert ismaintainer(user) is expected


@pytest.mark.django_db
def test_ismaintainer_false_for_non_maintainer(user: User) -> None:
    # user has no maintainer row at all
    assert ismaintainer(user) is False
