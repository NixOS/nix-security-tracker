{
  config,
  lib,
  ...
}:
let
  inherit (lib)
    mkIf
    mkDefault
    mkEnableOption
    optionalString
    ;
  cfg = config.services.nix-security-tracker;
  # FIXME(@fricklerhandwerk): Use the explicit names everywhere.
  # Maybe implement them as options so they have explicit documentation and can be overridden.
  app = "nix-security-tracker";
  # FIXME(@fricklerhandwerk): DRY the username, too.
  metrics-group = "${app}-metrics";
in
{
  options.services.nix-security-tracker.enable-exporters =
    (mkEnableOption "Prometheus metric exporters")
    // {
      default = true;
    };

  config = mkIf (cfg.enable && cfg.enable-exporters) {
    services.nix-security-tracker.settings.METRICS_TEXTFILE_DIR = mkDefault "/var/lib/${metrics-group}";

    users.groups.${metrics-group} = { };

    services.postgresql = {
      identMap = ''
        map-nix-security-tracker nix-security-tracker nix-security-tracker
        map-nix-security-tracker prometheus-sql-exporter nix-security-tracker
        ${optionalString cfg.enablePgbouncer "map-nix-security-tracker pgbouncer nix-security-tracker"}
        postgres postgres postgres
      '';
      authentication = ''
        local all nix-security-tracker ident map=map-nix-security-tracker
      '';
    };

    services.prometheus.exporters = {
      node = {
        enable = true;
        openFirewall = true;
        enabledCollectors = [ "textfile" ];
        extraFlags = [
          "--collector.textfile.directory=${cfg.settings.METRICS_TEXTFILE_DIR}"
        ];
      };
      postgres = {
        enable = true;
        openFirewall = true;
        # FIXME(@fricklerhandwerk): Remove when the fix to the upstream issue has landed in Nixpkgs:
        # https://github.com/prometheus-community/postgres_exporter/issues/1310
        extraFlags = [ "--no-collector.stat_replication" ];
      };
      sql = {
        enable = true;
        openFirewall = true;
        configuration.jobs.sectracker = {
          queries = import ../infra/sql-exporter-queries.nix // import ../infra/application-metrics.nix;
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

    systemd.tmpfiles.rules = [
      "d ${cfg.settings.METRICS_TEXTFILE_DIR} 2750 ${app} ${metrics-group} -"
    ];

    systemd.services.nix-security-tracker-migrations = {
      before = [
        "prometheus-node-exporter.service"
        "prometheus-postgres-exporter.service"
        "prometheus-sql-exporter.service"
      ];
    };
  };
}
