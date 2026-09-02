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
  vm-runner = pkgs.callPackage ./nix/vm-runner.nix {
    nixos-module = {
      imports = [
        ./nix/vm.nix
      ]
      ++ pkgs.lib.optional (builtins.pathExists ./.local) (
        pkgs.lib.warn "using configuration extension from ${toString ./.local}" ./.local
      );
    };
  };
  vm = pkgs.writeShellApplication {
    name = "vm";
    text = ''
      credentials=${pkgs.lib.escapeShellArg (toString ./.credentials)}
      mkdir -p "$credentials"
      (
        cd "$credentials"
        set +e -o noclobber
        echo foo > SECRET_KEY
        echo bar > GH_CLIENT_ID
        echo baz > GH_SECRET
        echo qux > GH_WEBHOOK_SECRET
        echo 123 > GH_APP_INSTALLATION_ID
        echo foo > GH_APP_PRIVATE_KEY
      ) 2>/dev/null || true
      runner=$(nix-build "${toString ./.}" -A vm-runner --no-out-link)
      exec "$runner/bin/run-vm"
    '';
  };

  git-hooks = pkgs.pre-commit-hooks {
    src =
      with pkgs.lib.fileset;
      toSource {
        root = ./.;
        fileset = gitTracked ./.;
      };
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
        pkgs.nodejs
        pkgs.npins
        pkgs.prefetch-npm-deps
        pkgs.zizmor
      ];
    };

  shell = pkgs.mkShellNoCC {
    packages = [
      vm
      pkgs.npins
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
    '';
  };

  tests = pkgs.callPackage ./nix/tests { inherit module; };
}
