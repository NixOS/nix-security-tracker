"""
Test setup for the new Preact/Vite UI

These fixtures build the JavaScript/CSS assets served by the test server.
This allows running tests from the source tree without rebuilding the Nix derivation
or starting the local development server.
"""

import shutil
import subprocess
from collections.abc import Generator
from pathlib import Path
from typing import Any

import pytest
from django.conf import settings


@pytest.fixture
def browser_context_args() -> dict[str, Any]:
    """
    Always run the SPA with JavaScript enabled.
    The legacy suite parametrizes fixture to test progressive enhancement of
    server-rendered pages, but that's not needed here.
    """
    return {"java_script_enabled": True}


@pytest.fixture(scope="session", autouse=True)
def _frontend_assets() -> Generator[None]:
    # settings.BASE_DIR is the ``src/`` directory; the frontend checkout is its sibling.
    frontend_dir = Path(settings.BASE_DIR).parent / "frontend"
    can_build = (frontend_dir / "package.json").is_file() and shutil.which(
        "npm"
    ) is not None

    if can_build:
        # Build runs in a subprocess, so pytest-socket's in-process --disable-socket does
        # not affect it (and the Vite build needs no network when node_modules is present).
        try:
            subprocess.run(
                ["npm", "run", "build"],
                cwd=frontend_dir,
                check=True,
                capture_output=True,
                text=True,
            )
        except (OSError, subprocess.CalledProcessError) as exc:
            output = getattr(exc, "stderr", None) or str(exc)
            pytest.skip(f"frontend build failed: {output}")
        settings.DJANGO_VITE["default"]["manifest_path"] = (
            frontend_dir / "dist" / ".vite" / "manifest.json"
        )

    manifest_path = settings.DJANGO_VITE["default"]["manifest_path"]

    if not manifest_path.is_file():
        pytest.skip(
            "frontend assets unavailable: no build present and the frontend could not be "
            f"built (looked for a manifest at {manifest_path}). "
            "Run `npm run build` in frontend/, or set DJANGO_VITE_MANIFEST_PATH."
        )

    # <dist>/.vite/manifest.json -> <dist>
    assets_dir = manifest_path.parent.parent

    settings.DJANGO_VITE["default"]["dev_mode"] = False
    existing_dirs = list(getattr(settings, "STATICFILES_DIRS", []))
    vite_entry = (settings.VITE_STATIC_URL_PREFIX, str(assets_dir))
    if vite_entry not in existing_dirs:
        settings.STATICFILES_DIRS = [*existing_dirs, vite_entry]

    # Drop cached state so the reconfiguration above is picked up:
    # - django-vite caches a singleton loader (instantiated at app startup, before the
    #   build) that holds dev_mode and the parsed manifest;
    # - the staticfiles finders cache reads STATICFILES_DIRS at first use.
    from django.contrib.staticfiles import finders
    from django_vite.core.asset_loader import DjangoViteAssetLoader

    DjangoViteAssetLoader._instance = None
    finders.get_finder.cache_clear()  # pyright: ignore[reportFunctionMemberAccess]

    yield
