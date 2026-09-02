from typing import Any

import pytest


@pytest.fixture
def browser_context_args() -> dict[str, Any]:
    """
    Always run the SPA with JavaScript enabled.
    The legacy suite parametrizes fixture to test progressive enhancement of
    server-rendered pages, but that's not needed here.
    """
    return {"java_script_enabled": True}
