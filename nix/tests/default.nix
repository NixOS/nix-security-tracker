{
  lib,
  pkgs,
  module,
}:
let
  # TODO: specify project/service name globally
  application = "nix-security-tracker";
  defaults = {
    documentation.enable = lib.mkDefault false;

    virtualisation = {
      memorySize = 2048;
      cores = 2;
      diskSize = 4096;
    };
  };
  dummy-nixpkgs =
    pkgs.runCommand "dummy-nixpkgs"
      {
        nativeBuildInputs = [ pkgs.git ];
      }
      ''
        mkdir -p $out/pkgs/top-level

        cat > $out/pkgs/top-level/release.nix << EOF
        { ... }:
        {
          hello.x86_64-linux = (import ${pkgs.path} {}).hello;
        }
        EOF

        cd $out
        git init --initial-branch=master
        git add -A
        git -c user.name=test -c user.email=test@test commit -m "test"
        git rev-parse HEAD > REVISION
      '';
  hydra = {
    port = toString 8080;
    mock = pkgs.writeText "hydra-mock" ''
      import json
      from http.server import BaseHTTPRequestHandler, HTTPServer

      nixpkgs_url = "file://${dummy-nixpkgs}"
      with open("${dummy-nixpkgs}/REVISION") as f:
          revision = f.read().strip()

      responses = {
          "jobset": {"inputs": {"nixpkgs": {"type": "git", "value": nixpkgs_url}}},
          "job": {"id": 1, "jobsetevals": [1]},
          "eval": {"id": 1, "jobsetevalinputs": {"nixpkgs": {"type": "git", "uri": nixpkgs_url, "revision": revision}}},
      }

      class H(BaseHTTPRequestHandler):
          def do_GET(self):
              body = responses.get(self.path.split("/")[1])
              if body is None:
                  self.send_response(404)
                  self.end_headers()
                  return
              self.send_response(200)
              self.send_header("Content-Type", "application/json")
              self.end_headers()
              self.wfile.write(json.dumps(body).encode())
          log_message = lambda *_: None

      HTTPServer(("", ${hydra.port}), H).serve_forever()
    '';
  };
in
pkgs.testers.runNixOSTest {
  name = "default";
  inherit defaults;
  nodes.server =
    { config, ... }:
    let
      cfg = config.services.${application};
    in
    {
      imports = [ module ];

      services.postgresql.ensureUsers = [
        {
          name = application;
          ensureDBOwnership = true;
          ensureClauses.createdb = true;
        }
      ];

      services.${application} = {
        enable = true;
        production = false;
        restart = "no"; # fail fast
        domain = "example.org";
        settings = {
          DEBUG = true;
          HYDRA_URL = "http://localhost:${hydra.port}";
          GIT_CLONE_URL = "file://${dummy-nixpkgs}";
          SYNC_GITHUB_STATE_AT_STARTUP = false;
          GH_ISSUES_PING_MAINTAINERS = true;
          GH_ORGANIZATION = "dummy";
          GH_ISSUES_REPO = "dummy";
          GH_COMMITTERS_TEAM = "dummy-committers";
          GH_SECURITY_TEAM = "dummy-security";
          GH_ISSUES_LABELS = [ "label with spaces" ];
          BASE_URL = "https://example.org";
        };
        env = {
          inherit (cfg.package.passthru) PLAYWRIGHT_BROWSERS_PATH;
        };
        secrets =
          let
            dummy-str = pkgs.writeText "dummy" "hello";
            dummy-int = pkgs.writeText "dummy" "123";
          in
          {
            SECRET_KEY = dummy-str;
            GH_CLIENT_ID = dummy-str;
            GH_SECRET = dummy-str;
            GH_WEBHOOK_SECRET = dummy-str;
            GH_APP_INSTALLATION_ID = dummy-int;
            GH_APP_PRIVATE_KEY = dummy-str;
          };
      };
      systemd.services.${hydra.mock.name} = {
        wantedBy = [ "multi-user.target" ];
        before = [ "${application}-fetch-all-channels.service" ];
        path = [ pkgs.python3 ];
        script = "python ${hydra.mock}";
      };
      systemd.services.setup-git-repo = {
        wantedBy = [ "multi-user.target" ];
        before = [ "${application}-server.service" ];
        serviceConfig.Type = "oneshot";
        path = [ pkgs.git ];
        script = ''
          # Create source repo with a known commit
          mkdir -p ${cfg.settings.LOCAL_NIXPKGS_CHECKOUT}
          cd ${cfg.settings.LOCAL_NIXPKGS_CHECKOUT}
          git init --bare
        '';
      };
    };
  testScript =
    let
      in-shell = command: python-lines: ''
        server.${command}("""echo '
        ${python-lines}
        ' | wst-manage shell""")
      '';
    in
    ''
      server.wait_for_unit("${application}-server.service")
      server.wait_for_unit("${application}-worker.service")
      server.wait_for_unit("${hydra.mock.name}.service")

      with subtest("Check that no migrations were missed"):
        server.succeed("wst-manage makemigrations --check --dry-run")

      with subtest("Check that channels are fetched and evaluations enqueued"):
        server.succeed("wst-manage fetch_all_channels")
        ${in-shell "succeed" ''
          import pathlib
          from shared.models import NixChannel, NixpkgsBranch

          assert NixpkgsBranch.objects.count() == 1, f"expected 1 branch, got {NixpkgsBranch.objects.count()}"
          assert NixChannel.objects.count() >= 1, f"expected at least 1 channel, got {NixChannel.objects.count()}"

          revision = pathlib.Path("${dummy-nixpkgs}/REVISION").read_text().strip()
          branch = NixpkgsBranch.objects.get()
          assert branch.head_sha1_commit == revision, f"expected {revision}, got {branch.head_sha1_commit}"
          channel_tips = NixChannel.objects.values_list("head_sha1_commit", flat=True)
          assert all(hash == revision for hash in channel_tips), f"unexpected channel tips: {[hash for hash in channel_tips if hash != revision]}"
        ''}
        ${in-shell "succeed" ''
          from shared.models import NixEvaluation
          assert NixEvaluation.objects.count() == 1, f"expected 1 evaluation, got {NixEvaluation.objects.count()}"
        ''}

      with subtest("Application tests"):
        ${
          ""
          /*
            XXX(@fricklerhandwerk): `pytest` searches in the working directory.
            In this environment it can't discover what's needed on its own.
            It's easiest to list the modules under test explicitly, which are found through `$PYTHONPATH`.
          */
        }server.succeed("wst-manage test -- --pyargs shared -v | tee /dev/ttyS0")
        ${
          ""
          /*
            XXX(@fricklerhandwerk): We must test modules in separate invocations.
            Importing fixtures from one module in another doesn't work in one invocation of `pytest`.
            This is because `conftest.py` files are discovered from the provided module names and registered globally.
          */
        }server.succeed("wst-manage test -- --pyargs api -v | tee /dev/ttyS0")
        server.succeed("wst-manage test -- --pyargs webview -v | tee /dev/ttyS0")

      with subtest("Check that stylesheet is served"):
        machine.succeed("curl --fail -H 'Host: example.org' http://localhost/static/reset.css")
        machine.succeed("curl --fail -H 'Host: example.org' http://localhost/static/font.css")
        machine.succeed("curl --fail -H 'Host: example.org' http://localhost/static/colors.css")
        machine.succeed("curl --fail -H 'Host: example.org' http://localhost/static/utility.css")
        machine.succeed("curl --fail -H 'Host: example.org' http://localhost/static/cvss-tags.css")
        machine.succeed("curl --fail -H 'Host: example.org' http://localhost/static/page-layout.css")
        machine.succeed("curl --fail -H 'Host: example.org' http://localhost/static/icons/style.css")

      with subtest("Check that admin interface is served"):
        server.succeed("curl --fail -L -H 'Host: example.org' http://localhost/admin")

      with subtest("Check that frontend UI is served"):
        server.succeed("curl --fail -H 'Host: example.org' http://localhost/ui-v2/")
        # SPA fallback: unknown routes still return the same page
        server.succeed("curl --fail -H 'Host: example.org' http://localhost/ui-v2/some/route")
        # Vite-built assets are served by nginx with immutable cache headers
        result = server.succeed("curl -sI -H 'Host: example.org' http://localhost/static/vite/.vite/manifest.json")
        assert "200" in result, f"Expected 200 for manifest.json, got: {result}"

      with subtest("Check that evaluations succeed"):
          ${
            # XXX(@fricklerhandwerk): We do this at the end since it takes a while and would otherwise stall the Django tests.
            in-shell "wait_until_succeeds" ''
              from shared.models import (
                NixChannel,
                NixEvaluation,
                NixDerivation,
                NixDerivationMeta,
                NixMaintainer,
                NixLicense,
              )
              from shared.models.package import Package, PackageDerivation
              assert NixEvaluation.objects.filter(
                state=NixEvaluation.EvaluationState.COMPLETED,
              ).count() == 1
              for model, count in [
                (NixDerivation, 1),
                (NixDerivationMeta, 1),
                (Package, 1),
                (PackageDerivation, 1),
                (NixMaintainer, 1),
                (NixLicense, 1),
              ]:
                assert model.objects.count() == count, f"{model._meta.object_name}: expected {count}, got {model.objects.count()}"

              # Maintainers should only be attached to derivations from the tracking branch.
              from django.conf import settings
              tracking_meta = NixDerivationMeta.objects.get(
                derivation__parent_evaluation__channel__release_branch__name=settings.TRACKING_BRANCH,
              )
              assert tracking_meta.maintainers.exists(), f"{settings.TRACKING_BRANCH} meta has no maintainers"
              for m in NixDerivationMeta.objects.exclude(
                derivation__parent_evaluation__channel__release_branch__name=settings.TRACKING_BRANCH,
              ):
                assert not m.maintainers.exists(), f"{m.derivation.parent_evaluation.channel.channel_branch}) has unexpected maintainers"
            ''
          }
    '';
}
