# A module to ease setting up a local PostgreSQL database to start with development.
# This lets you specify your local unix user as which you run the tracker and
# gives it full access to the nix-security-tracker database user.

{
  config,
  lib,
  ...
}:
let
  cfg = config.nix-security-tracker-dev-environment;

  original = builtins.fromJSON (builtins.readFile ../contrib/grafana-dashboard.json);

  replace-uid =
    v:
    if builtins.isAttrs v then
      builtins.mapAttrs (_: replace-uid) v
    else if builtins.isList v then
      map replace-uid v
    else if v == "\${DS_PROMETHEUS}" then
      "prometheus"
    else
      v;

  # We can't use subsitution with file provisioning, so replace the data source literally.
  local-dashboard = builtins.toFile "grafana-dashboard-local.json" (
    builtins.toJSON (
      replace-uid (
        original
        // {
          templating = original.templating // {
            list = map (
              item:
              item
              // {
                datasource = {
                  type = "prometheus";
                  uid = "prometheus";
                };
              }
            ) original.templating.list;
          };
        }
      )
    )
  );
in
{

  options.nix-security-tracker-dev-environment = {
    enable = lib.mkEnableOption (lib.mdDoc "development environment for nix-security-tracker");
    user = lib.mkOption {
      type = lib.types.str;
      description = "Unix user that runs the nix-security-tracker to connect to the database";
    };
    enableDashboard = lib.mkEnableOption "local Grafana dashboard for monitoring";
  };

  config = lib.mkIf cfg.enable {
    services = {
      postgresql = {
        enable = true;
        ensureDatabases = [ "nix-security-tracker" ];
        ensureUsers = [
          {
            name = "nix-security-tracker";
            ensureDBOwnership = true;
            ensureClauses.createdb = true;
          }
        ];
        # This is to simplify invocation of Postgres commands such that it doesn't require running everything with `sudo.`
        identMap = ''
          map-nix-security-tracker ${cfg.user} nix-security-tracker
          map-nix-security-tracker ${config.services.prometheus.exporters.sql.user} nix-security-tracker
          map-postgres ${config.services.prometheus.exporters.postgres.user} postgres
          ${
            # Required for NixOS-specific Postgres self-checks
            ""
          }map-postgres postgres postgres
        '';
        authentication = ''
          local all nix-security-tracker ident map=map-nix-security-tracker
          local all postgres ident map=map-postgres
        '';
      };

      prometheus = lib.mkIf cfg.enableDashboard {
        enable = true;
        scrapeConfigs =
          let
            job = job_name: {
              inherit job_name;
              static_configs = [
                { targets = [ "localhost:${toString config.services.prometheus.exporters.${job_name}.port}" ]; }
              ];
            };
          in
          map job [
            "node"
            "postgres"
            "sql"
          ];
        exporters = {
          node.enable = true;
          postgres.enable = true;
          sql = {
            enable = true;
            configuration.jobs.sectracker = {
              queries = import ../infra/sql-exporter-queries.nix;
              connections =
                let
                  db-name = builtins.head config.services.postgresql.ensureDatabases;
                  db-user = (builtins.head config.services.postgresql.ensureUsers).name;
                in
                [ "postgres://${db-user}@/${db-name}?host=/run/postgresql" ];
              interval = "1h";
            };
          };
        };
      };

      grafana = lib.mkIf cfg.enableDashboard {
        enable = true;
        settings = {
          server = {
            http_addr = "127.0.0.1";
            http_port = 3000;
          };
          security.secret_key = "dev-only-secret-key";
          "auth.anonymous" = {
            enabled = true;
            org_role = "Viewer";
          };
          dashboards.default_home_dashboard_path = "${local-dashboard}";
        };
        provision = {
          enable = true;
          datasources.settings.datasources = [
            {
              name = "Prometheus";
              type = "prometheus";
              uid = "prometheus";
              url = "http://localhost:${toString config.services.prometheus.port}";
              isDefault = true;
            }
          ];
          dashboards.settings.providers = [
            {
              name = "sectracker";
              options.path = local-dashboard;
            }
          ];
        };
      };
    };
  };
}
