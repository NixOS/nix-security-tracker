{ lib, pkgs, ... }:
rec {
  src = ../.;
  default_stages = [
    "manual"
    "pre-push"
  ];
  excludes = [
    "\\.min.css$"
    "npins"
    "migrations"
    "grafana-dashboard.json"
  ];
  hooks =
    let
      # XXX(@fricklerhandwerk): due to implementation details of pre-commit.nix this is
      # required for running in CI when building the hooks as a derivation
      stages = [ "manual" ];
    in
    lib.mapAttrs (_: v: v // { inherit stages; }) {
      # Nix setup
      nixfmt.enable = true;
      statix = {
        enable = true;
        # FIXME(@fricklerhandwerk): `git-hooks.nix` currently renders `statix` command-line arguments incorrectly
        entry = lib.mkForce "${pkgs.statix}/bin/statix check ${
          lib.concatMapStringsSep " " (p: "--ignore ${lib.escapeShellArg p}") excludes
        }";
      };
      deadnix.enable = true;

      # Python setup
      ruff.enable = true;
      ruff-format = {
        enable = true;
        types = [
          "text"
          "python"
        ];

        entry = "${pkgs.lib.getExe pkgs.ruff} format";
      };

      pyright =
        let
          pyEnv = pkgs.python3.withPackages (_: pkgs.nix-security-tracker.propagatedBuildInputs);
          wrappedPyright = pkgs.runCommand "pyright" { nativeBuildInputs = [ pkgs.makeWrapper ]; } ''
            makeWrapper ${pkgs.pyright}/bin/pyright $out \
              --set PYTHONPATH ${pyEnv}/${pyEnv.sitePackages} \
              --prefix PATH : ${pyEnv}/bin \
              --set PYTHONHOME ${pyEnv}
          '';
        in
        {
          enable = true;
          entry = lib.mkForce (builtins.toString wrappedPyright);
        };

      prettier = {
        enable = true;
        excludes = [
          "\\.html$"
          "^frontend/"
        ];
      };

      # Frontend linting and formatting
      biome = {
        enable = true;
        name = "biome";
        entry = "${pkgs.writeShellScript "biome-check" ''
          cd frontend && exec ${pkgs.lib.getExe pkgs.biome} check --write .
        ''}";
        files = "^frontend/.*\\.(ts|tsx|js|json)$";
        pass_filenames = false; # false because the passed paths are repo-root-relative
      };

      djlint =
        let
          djlint-config =
            with builtins;
            toFile "djlint.json" (toJSON {
              indent = 2;
              preserve_blank_lines = true;
              # FIXME(@fricklerhandwerk): Put all user-visible text on separate lines and enable this.
              # preserve_leading_space = true;
            });
        in
        {
          enable = true;
          name = "djlint";
          entry = "${with pkgs; lib.getExe djlint} --reformat --quiet --configuration=${djlint-config}";
          files = "\\.html$";
        };

      lychee = {
        enable = true;
        name = "lychee";
        extraPackages = [ pkgs.cacert ];
        entry = "${pkgs.lib.getExe pkgs.lychee} --offline --no-progress";
        files = "\\.md$";
        excludes = [ "\\.html$" ];
      };

      vale =
        let
          sentence-case = pkgs.writeText "SentenceCase.yml" ''
            extends: capitalization
            message: "Should be in sentence case: '%s'"
            level: error
            scope: heading
            # $title, $sentence, $lower, $upper, or a pattern.
            match: $sentence
            exceptions:
              - Nix
              - Nixpkgs
              - CPE
              - CPEs
              - CVE
              - CVEs
              - Sentry
              - Hetzner
              - Hetzner Cloud
              - Terraform
              - OpenTofu
              - SSH
              - API
              - UI
              - Preact
              - Vite
              - Orval
          '';

          terms = pkgs.writeText "Terms.yml" ''
            extends: existence
            message: "Use 'Nixpkgs security tracker' instead of '%s'"
            level: error
            nonword: true
            raw:
              - 'Nixpkgs Security Tracker'
          '';

          styles-dir = pkgs.runCommand "vale-styles" { } ''
            mkdir -p $out/default
            mkdir -p $out/config/vocabularies # This must exist for Vale to run.
            cp ${terms} $out/default/Terms.yml
            cp ${sentence-case} $out/default/SentenceCase.yml
          '';

          vale-config = pkgs.writeText "vale.ini" ''
            StylesPath = ${styles-dir}
            MinAlertLevel = suggestion

            [*.md]
            BasedOnStyles = default

            [*.html]
            BasedOnStyles = default
          '';
        in
        {
          enable = true;
          name = "vale";
          entry = "${pkgs.lib.getExe pkgs.vale} --config=${vale-config}";
          files = "\\.(md|html)$";
        };
    };
}
