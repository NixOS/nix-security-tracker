{
  lib,
  pkgs,
  module,
}:
let
  # TODO: specify project/service name globally
  application = "web-security-tracker";
  defaults = {
    documentation.enable = lib.mkDefault false;

    virtualisation = {
      memorySize = 2048;
      cores = 2;
    };
  };
  channels = with builtins; toFile "channels.json" (toJSON (import ./channels.nix));
  channels-port = toString 8080;
in
pkgs.testers.runNixOSTest {
  name = "default";
  inherit defaults;
  nodes.server =
    { config, ... }:
    let
      cfg = config.services.${application};
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
            git init
            git add -A
            git -c user.name=test -c user.email=test@test commit -m "test"
            git rev-parse HEAD > REVISION
          '';
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
          CHANNEL_MONITORING_URL = "http://localhost:${channels-port}/channels.json";
          GIT_CLONE_URL = "file://${dummy-nixpkgs}";
          SYNC_GITHUB_STATE_AT_STARTUP = false;
          GH_ISSUES_PING_MAINTAINERS = true;
          GH_ORGANIZATION = "dummy";
          GH_ISSUES_REPO = "dummy";
          GH_COMMITTERS_TEAM = "dummy-committers";
          GH_SECURITY_TEAM = "dummy-security";
          GH_ISSUES_LABELS = [ "label with spaces" ];
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
      systemd.services.mock-channels = {
        wantedBy = [ "multi-user.target" ];
        before = [ "${application}-server.service" ];
        path = with pkgs; [
          python3
          gnused
        ];
        script = ''
          cd /tmp
          sed "s/@commit@/$(cat ${dummy-nixpkgs}/REVISION)/g" ${channels} > channels.json
          python -m http.server ${channels-port}
        '';
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
      server.wait_for_unit("mock-channels.service")

      with subtest("Check that channel are fetched and evaluations enqueued"):
        server.succeed("wst-manage fetch_all_channels")
        ${in-shell "succeed" ''
          from shared.models import NixChannel
          assert NixChannel.objects.count() == 4
        ''}
        ${in-shell "succeed " ''
          from shared.models import NixEvaluation
          assert NixEvaluation.objects.count() == 3
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
        }server.succeed("wst-manage test -- --pyargs webview -v | tee /dev/ttyS0")

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

      with subtest("Check that evaluations succeed"):
          ${
            # XXX(@fricklerhandwerk): We do this at the end since it takes a while and would otherwise stall the Django tests.
            in-shell "wait_until_succeeds" ''
              from shared.models import (
                NixEvaluation,
                NixDerivation,
                NixDerivationMeta,
                NixMaintainer,
                NixLicense,
              )
              assert NixEvaluation.objects.filter(
                state=NixEvaluation.EvaluationState.COMPLETED,
              ).count() == 3
              for model, count in [
                (NixDerivation, 3),
                (NixDerivationMeta, 3),
                (NixMaintainer, 1),
                (NixLicense, 1),
              ]:
                assert model.objects.count() == count, f"{model._meta.object_name}: expected {count}, got {model.objects.count()}"
            ''
          }
    '';
}
