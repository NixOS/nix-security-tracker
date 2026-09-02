{
  modulesPath,
  config,
  lib,
  pkgs,
  ...
}:

let
  shared = config.virtualisation.sharedDirectories;
  cfg = config.services.nix-security-tracker;
  vite-port = 5173;
  frontend-deps = (pkgs.callPackage ./frontend.nix { }).overrideAttrs {
    dontBuild = true;
    installPhase = ''
      mv node_modules $out
      mkdir $out/.vite
      ln -s .bin $out/bin
    '';
  };
  frontend-node-modules = "${shared.frontend.target}/node_modules";
in
{
  imports = [
    (modulesPath + "/virtualisation/qemu-vm.nix")
    ./configuration.nix
  ];

  networking.hostName = "sectracker-local";

  services = {
    getty.autologinUser = "root";

    nginx = {
      virtualHosts = {
        "_".default = lib.mkForce false;
        ${cfg.domain} = {
          default = true;
          # The QEMU host port is assigned dynamically, so the browser's origin can't be anticipated in the CSRF configuration.
          # Therefore we forward the Host header from the client as it is.
          locations = {
            "/".extraConfig = ''
              proxy_set_header Host $http_host;
            '';
            "/static/vite/" = lib.mkForce {
              proxyPass = "http://127.0.0.1:${toString vite-port}";
              proxyWebsockets = true;
              extraConfig = ''
                proxy_set_header Host $http_host;
              '';
            };
          };
        };
      };
      # Passing the Host header as provided by the client is prevented by the nginx config checker gixy.
      # The interface to skip checks granularly is not exposed to Nix expressions.
      validateConfigFile = false;
    };

    postgresql = {
      ensureUsers = [
        {
          name = "nix-security-tracker";
          ensureClauses.createDb = true;
        }
        {
          name = "root";
          ensureClauses.superuser = true;
        }
      ];
      authentication = "local all all trust";
    };

    nix-security-tracker = {
      enable = true;
      domain = config.networking.hostName;
      production = false;
      manage = "${shared.src.target}/manage.py";
      env = {
        PYTHONPATH = shared.src.target;
        inherit (pkgs.nix-security-tracker.passthru) PLAYWRIGHT_BROWSERS_PATH;
      };
      extra-python-packages = pkgs.nix-security-tracker.passthru.nativeCheckInputs;
      secrets = lib.mapAttrs (name: _: "${shared.credentials.target}/${name}") (
        lib.filterAttrs (_: type: type == "regular") (builtins.readDir shared.credentials.source)
      );
      settings = {
        DEBUG = true;
        SYNC_GITHUB_STATE_AT_STARTUP = false;
        GH_ISSUES_PING_MAINTAINERS = false;
        GH_ORGANIZATION = "Nix-Security-WG";
        GH_ISSUES_REPO = "sectracker-testing";
        GH_SECURITY_TEAM = "sectracker-testing-security";
        GH_COMMITTERS_TEAM = "sectracker-testing-committers";
        VITE_DEV_SERVER_PORT = config.local.port-offset + config.local.ports."security tracker";
      };
      maxJobProcessors = 1;
    };
  };

  local = {
    port-offset = 50000;
    ports = {
      "security tracker" = config.services.nginx.defaultHTTPListenPort;
    };
    mapped-users = [ "nix-security-tracker" ];
  };

  systemd = {
    services = {
      # Don't start expensive services on boot; trigger them manually when needed.
      nix-security-tracker-backfill-package-links.wantedBy = lib.mkForce [ ];

      # The Nixpkgs checkout directory is shared by the host, systemd cannot chown it.
      # Drop it from StateDirectory to prevent the service from failing at startup.
      nix-security-tracker-checkout.serviceConfig.StateDirectory = lib.mkForce [
        "nix-security-tracker"
      ];

      # Run service from local source, to enable auto-reload.
      nix-security-tracker-server = {
        wants = [ "nix-security-tracker-vite.service" ];
        after = [ "nix-security-tracker-vite.service" ];
        script = lib.mkForce ''
          ${cfg.manage-prefix}manage runserver 127.0.0.1:${toString cfg.wsgi-port}
        '';
      };

      nix-security-tracker-vite = {
        wantedBy = [ "nix-security-tracker.target" ];
        partOf = [ "nix-security-tracker.target" ];
        environment.CHOKIDAR_USEPOLLING = "1";
        path = [ pkgs.nodejs ];
        serviceConfig = {
          WorkingDirectory = shared.frontend.target;
          ExecSearchPath = lib.makeBinPath [ frontend-node-modules ];
          ExecStart = "vite --configLoader runner --host 127.0.0.1 --port ${toString vite-port}";
          # Vite wants `node_modules` in the working directory to find dependencies.
          BindReadOnlyPaths = [ "${frontend-deps}:${frontend-node-modules}" ];
          # Vite wants to write to its own module directory... *sigh*
          TemporaryFileSystem = [ "${frontend-node-modules}/.vite" ];
        };
      };

      nix-security-tracker-orval = {
        after = [ "nix-security-tracker-server.service" ];
        requires = [ "nix-security-tracker-server.service" ];
        wantedBy = [ "nix-security-tracker.target" ];
        partOf = [ "nix-security-tracker.target" ];
        path = config.systemd.services.nix-security-tracker-server.path ++ [
          pkgs.nodejs
          pkgs.watchexec
          pkgs.bash
          frontend-node-modules
        ];
        environment = removeAttrs config.systemd.services.nix-security-tracker-server.environment [
          "PATH"
        ];
        serviceConfig = {
          User = "nix-security-tracker";
          WorkingDirectory = shared.frontend.target;
          LoadCredential = lib.mapAttrsToList (n: p: "${n}:${p}") cfg.secrets;
          BindReadOnlyPaths = [ "${frontend-deps}:${frontend-node-modules}" ];
        };
        script = ''
          watchexec --shell=bash --poll=2s -w ${shared.src.target}/api --exts py -- \
            '${cfg.manage-prefix}manage spectacular --file ./schema.yaml && orval --project api-local'
        '';
      };

      nix-security-tracker-server-ready = {
        description = "Wait for the security tracker server to accept connections";
        after = [ "nix-security-tracker-server.service" ];
        requires = [ "nix-security-tracker-server.service" ];
        wantedBy = [ "nix-security-tracker.target" ];
        partOf = [ "nix-security-tracker.target" ];
        path = [ pkgs.curl ];
        serviceConfig = {
          Type = "oneshot";
          RemainAfterExit = true;
        };
        script = ''
          until curl --silent --output /dev/null http://127.0.0.1:${toString cfg.wsgi-port}; do
            sleep 1
          done
        '';
      };

      "serial-getty@ttyS0" = {
        wants = [ "nix-security-tracker-server-ready.service" ];
        after = [ "nix-security-tracker-server-ready.service" ];
      };
    };

    tmpfiles.rules = [
      "d /frontend/src/api/generated 0755 nix-security-tracker nix-security-tracker -"
    ];
  };

  environment.systemPackages = with pkgs; [
    pv
  ];

  virtualisation = {
    graphics = false;
    memorySize = 10 * 1024;
    cores = 2;
    diskSize = 40 * 1024;
    sharedDirectories = {
      credentials = {
        source = toString ../.credentials;
        target = "/credentials";
        ensure-exists = true;
      };
      nixpkgs = {
        source = toString ../nixpkgs;
        target = cfg.settings.LOCAL_NIXPKGS_CHECKOUT;
        ensure-exists = true;
      };
      src = {
        source = toString ../src;
        target = "/src";
      };
      frontend = {
        source = toString ../frontend;
        target = "/frontend";
      };
    };
  };

  system.stateVersion = "24.05";
}
