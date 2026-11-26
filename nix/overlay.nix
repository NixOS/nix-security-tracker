final: prev:
let
  sources = import ../npins;
in
{
  nix-security-tracker-logos = final.runCommand "nix-security-tracker-logos" { } ''
    mkdir -p $out
    cp ${sources.nixos-logo} $out/nixos-logo.svg
    cp ${sources.cve-logo} $out/cveLogo.svg
    cp ${sources.nixos-logo-horizontal} $out/nixpkgsLogo.svg
  '';

  python3-sectracker = prev.python3.override {
    packageOverrides = pyfinal: pyprev: {
      # FIXME(@fricklerhandwerk): remove once Nixpkgs ships a release that includes the fix for the flaky test
      # https://github.com/getsentry/sentry-python/issues/8031
      sentry-sdk = pyprev.sentry-sdk.overridePythonAttrs (old: rec {
        version = "2.74.0";
        src = final.fetchFromGitHub {
          owner = "getsentry";
          repo = "sentry-python";
          tag = version;
          hash = "sha256-LB8u5yuI47if9rsW9w0d/UsPtj2/6b9yvziaqqxp68E=";
        };
        disabledTests = (old.disabledTests or [ ]) ++ [
          # FIXME(@fricklerhandwerk): remove once the race condition in the test setup is fixed upstream:
          # https://github.com/getsentry/sentry-python/pull/8228
          "test_get_current_thread_meta_bad_running_thread"
        ];
      });
      psycopg2 = pyfinal.psycopg;
      # FIXME(@fricklerhandwerk): remove once upstream fix is merged into django-pgpubsub
      # https://github.com/PaulGilmartin/django-pgpubsub/pull/89
      django-pgpubsub = pyprev.django-pgpubsub.overridePythonAttrs (old: {
        patches = (old.patches or [ ]) ++ [ ../nix/django-pgpubsub-fix-notify.patch ];
      });
      sgqlc = pyfinal.buildPythonPackage rec {
        pname = "sgqlc";
        version = "18";
        pyproject = true;
        src = final.fetchPypi {
          inherit pname version;
          hash = "sha256-oJ92+2midgUjFE+NOsvwahs3EPY7+H+6wULTU4sdY5s=";
        };
        build-system = [ pyfinal.poetry-core ];
        dependencies = [ pyfinal.graphql-core ];
        pythonImportsCheck = [ "sgqlc" ];
      };
    };
  };
  # go through the motions to make a flake-incompat project use the build
  # inputs we want
  pre-commit-hooks = final.callPackage "${sources.pre-commit-hooks}/nix/run.nix" {
    tools = import "${sources.pre-commit-hooks}/nix/call-tools.nix" final;
    isFlakes = false;
  };

  nix-security-tracker = final.python3-sectracker.pkgs.callPackage ./package.nix { inherit sources; };
}
