{
  system ? builtins.currentSystem,
  sources ? import ./npins,
  overlay ? import ./nix/overlay.nix,
  pkgs ? import sources.nixpkgs {
    config = { };
    overlays = [ overlay ];
    inherit system;
  },
}:
rec {
  inherit pkgs;

  # For exports.
  overlays = [ overlay ];
  package = pkgs.nix-security-tracker;
  module = import ./nix/configuration.nix;
  dev-container = import ./infra/container.nix;
  dev-setup = import ./nix/dev-setup.nix;

  git-hooks = pkgs.pre-commit-hooks {
    src = ./.;
    imports = [ ./nix/git-hooks.nix ];
  };

  format = pkgs.writeShellApplication {
    name = "format";
    runtimeInputs = git-hooks.enabledPackages ++ [ git-hooks.config.package ];
    text = ''
      pre-commit run --all-files --hook-stage manual
    '';
  };

  # commands for CI actions
  ci =
    let
      deploy = pkgs.writeShellApplication {
        name = "deploy";
        text = builtins.readFile ./infra/deploy.sh;
        runtimeInputs = with pkgs; [
          nixos-rebuild
          coreutils
          nix
        ];
        # TODO: satisfy shellcheck
        checkPhase = "";
      };
    in
    pkgs.symlinkJoin {
      name = "ci";
      paths = [
        deploy
        pkgs.npins
        pkgs.zizmor
      ];
    };

  shell =
    let
      manage = pkgs.writeScriptBin "manage" ''
        exec "${pkgs.python3}/bin/python" "${toString ./src/manage.py}" "$@"
      '';
      # Run this for a quick start.
      # Login and publishing issues requires setting up credentials properly.
      dummy-credentials = pkgs.writeShellApplication {
        name = "dummy-credentials";
        runtimeInputs = [ pkgs.python3 ];
        text = ''
          dir="${toString ./.credentials}"
          mkdir -p "$dir"
          cd "$dir"
          set -o noclobber
          python3 -c 'import secrets; print(secrets.token_hex(100))' > SECRET_KEY
          echo bar > GH_CLIENT_ID
          echo baz > GH_SECRET
          echo qux > GH_WEBHOOK_SECRET
          echo 123 > GH_APP_INSTALLATION_ID
          echo foo > GH_APP_PRIVATE_KEY
        '';
      };
    in
    pkgs.mkShellNoCC {
      env = {
        DATABASE_URL = "postgres://nix-security-tracker@/nix-security-tracker";
        # psql doesn't take DATABASE_URL
        PGDATABASE = "nix-security-tracker";
        PGUSER = "nix-security-tracker";
        CREDENTIALS_DIRECTORY = toString ./.credentials;
        inherit (package.passthru) PLAYWRIGHT_BROWSERS_PATH;
        DJANGO_SETTINGS = builtins.toJSON {
          DEBUG = true;
          LOCAL_NIXPKGS_CHECKOUT = toString ./. + "/nixpkgs";
          PRODUCTION = false;
          SYNC_GITHUB_STATE_AT_STARTUP = false;
          GH_ISSUES_PING_MAINTAINERS = false;
          GH_ORGANIZATION = "Nix-Security-WG";
          GH_ISSUES_REPO = "sectracker-testing";
          GH_SECURITY_TEAM = "sectracker-testing-security";
          GH_COMMITTERS_TEAM = "sectracker-testing-committers";
          STATIC_ROOT = "${toString ./src/static}";
          REVISION =
            let
              git = builtins.fetchGit {
                url = ./.;
                shallow = true;
              };
            in
            if git ? dirtyRev then "${git.shortRev}-dirty" else git.shortRev;
        };
      };

      packages = [
        dummy-credentials
        manage
        package
        # Explicitly pin git from nixpkgs to ensure the `fetch_all_channels` management command
        # and the Nix evaluation pipeline (which clones and fetches Nixpkgs commits via shared/git.py)
        # always use a known-good version. Without this, the shell falls back to the system git,
        # which may be too old to support required flags (e.g. `git fetch --porcelain` requires git 2.41+)
        # and can cause silent failures or broken behaviour in development.
        pkgs.git
        pkgs.nix-eval-jobs
        pkgs.npins
        pkgs.pv
        (import sources.agenix { inherit pkgs; }).agenix
        format
      ]
      ++ git-hooks.enabledPackages;

      shellHook = ''
        ${(pkgs.pre-commit-hooks {
          src = ./.;
          imports = [ ./nix/git-hooks.nix ];
          hooks.commitizen = {
            enable = true;
            stages = [ "commit-msg" ];
          };
        }).shellHook
        }

        ln -sf ${sources.htmx}/dist/htmx.js src/webview/static/htmx.min.js

        mkdir -p $CREDENTIALS_DIRECTORY
        # TODO(@fricklerhandwerk): move all configuration over to pydantic-settings
        touch .settings.py
        export USER_SETTINGS_FILE=${builtins.toString ./.settings.py}
      '';
    };

  tests = pkgs.callPackage ./nix/tests { inherit module; };
}
