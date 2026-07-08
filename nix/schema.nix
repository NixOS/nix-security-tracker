# Generates the OpenAPI schema from the Django REST API offline,
# via `manage spectacular`. Used as a build input to the frontend so Orval can
# generate its typed client during the Nix build / CI (no running server needed).
#
# Schema generation only introspects the URLconf and serializers; it touches
# neither the database nor the network, as long as SYNC_GITHUB_STATE_AT_STARTUP is
# false (otherwise shared/apps.py::ready() syncs GitHub state at import time).
#
# We run from a writable copy of `src` (rather than the installed package) because
# project/settings.py creates BASE_DIR-relative directories at import time, and the
# installed package lives in the read-only Nix store.
{
  runCommand,
  python3,
  nix-security-tracker,
}:
let
  pythonEnv = python3.withPackages (_: [ nix-security-tracker ]);

  # Dummy secrets: required for the settings module to import, never used here.
  credentials = runCommand "wst-schema-credentials" { } ''
    mkdir -p $out
    for name in SECRET_KEY GH_CLIENT_ID GH_SECRET GH_WEBHOOK_SECRET GH_APP_PRIVATE_KEY; do
      echo dummy > "$out/$name"
    done
    echo 123 > "$out/GH_APP_INSTALLATION_ID"
  '';
in
runCommand "nix-security-tracker-openapi-schema"
  {
    CREDENTIALS_DIRECTORY = credentials;
    # A DATABASE_URL must parse, but no connection is opened during generation.
    DATABASE_URL = "postgres://nix-security-tracker@localhost/nix-security-tracker";
    DJANGO_SETTINGS = builtins.toJSON {
      DEBUG = true;
      PRODUCTION = false;
      # Keep startup free of DB/network side effects (see note above).
      SYNC_GITHUB_STATE_AT_STARTUP = false;
      REVISION = "schema";
      STATIC_ROOT = "/build/static";
      LOCAL_NIXPKGS_CHECKOUT = "/build/nixpkgs";
      GH_ISSUES_PING_MAINTAINERS = false;
      GH_ORGANIZATION = "dummy";
      GH_ISSUES_REPO = "dummy";
      GH_SECURITY_TEAM = "dummy-security";
      GH_COMMITTERS_TEAM = "dummy-committers";
      BASE_URL = "http://localhost:8000";
    };
  }
  ''
    # Run from a writable copy of the source so import-time directory creation in
    # settings.py (EVALUATION_LOGS_DIRECTORY, CVE_CACHE_DIR) succeeds.
    cp -r ${../src} src
    chmod -R u+w src

    # STATIC_ROOT and LOCAL_NIXPKGS_CHECKOUT (a DirectoryPath) must exist.
    mkdir -p /build/static /build/nixpkgs

    export PYTHONPATH="$PWD/src''${PYTHONPATH:+:$PYTHONPATH}"
    ${pythonEnv}/bin/python src/manage.py spectacular --file "$out"
  ''
