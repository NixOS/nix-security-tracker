{ config, lib, ... }:
let
  sources = import ../../npins;
  trackers = [
    "tracker.security.nixos.org"
    "tracker-staging.security.nixos.org"
  ];

  onPort = port: map (host: "${host}:${toString port}") trackers;

  job = job_name: targets: {
    inherit job_name;
    static_configs = [ { inherit targets; } ];
    relabel_configs = [
      {
        source_labels = [ "__address__" ];
        regex = "([^:]+):[0-9]+";
        target_label = "instance";
        replacement = "$1";
      }
    ];
  };
in
{
  imports = [
    "${sources.disko}/module.nix"
    ./disko.nix
    ./hardware-configuration.nix
    ../common.nix
  ];
  networking = {
    hostId = "ee244c4b";
    hostName = "securitydedi";
    nameservers = [ "1.1.1.1" ];
    interfaces."enp8s0" = {
      ipv4.addresses = [
        {
          address = "65.21.200.158";
          prefixLength = 26;
        }
      ];
      ipv6.addresses = [
        {
          address = "2a01:4f9:3b:220e::2";
          prefixLength = 64;
        }
      ];
    };
    defaultGateway = "65.21.200.129";
  };

  services = {
    journald.upload = {
      enable = true;
      settings.Upload.URL = "http://127.0.0.1:9428/insert/journald";
    };
    prometheus = {
      enable = true;
      scrapeConfigs = [
        (job "node" ([ "localhost:9100" ] ++ onPort 9100) // { scrape_interval = "10s"; })
        (job "postgresql" (onPort 9187))
        (job "sql" (onPort 9237))
        (job "django" (onPort 443) // { scheme = "https"; })
      ];
    };
    victorialogs = {
      enable = true;
    };
    zfs.autoScrub.enable = true;
    # TODO: @erethon Dedup with the VM config
    grafana =
      let
        replace-uid =
          with lib;
          v:
          if isAttrs v then
            mapAttrs (_: replace-uid) v
          else if isList v then
            map replace-uid v
          else if v == "\${DS_PROMETHEUS}" || v == "\${ds_prometheus}" then
            "prometheus"
          else
            v;

        pin-dashboard =
          name: source: with builtins; toFile name (toJSON (replace-uid (fromJSON (readFile source))));

        node-dashboard = pin-dashboard "node-dashboard.json" sources.grafana-dashboard-node;
        postgres-dashboard = pin-dashboard "postgres-dashboard.json" sources.grafana-dashboard-postgres;

        local-dashboard =
          let
            original = with builtins; fromJSON (readFile ../../contrib/grafana-dashboard.json);
          in
          builtins.toFile "grafana-dashboard.json" (
            builtins.toJSON (
              replace-uid (
                original
                // {
                  refresh = "1m";
                }
              )
            )
          );
      in
      {
        enable = true;
        settings = {
          server.http_addr = "127.0.0.1";
          security.secret_key = "will-be-scraped-soon-:)";
          "auth.anonymous" = {
            enabled = true;
            org_role = "Viewer";
          };
          dashboards.default_home_dashboard_path = local-dashboard;
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
              jsonData.timeInterval = "1m";
            }
          ];
          dashboards.settings.providers = [
            {
              name = "sectracker";
              options.path = local-dashboard;
            }
            {
              name = "node";
              options.path = node-dashboard;
            }
            {
              name = "postgres";
              options.path = postgres-dashboard;
            }
          ];
        };
      };
  };

  system.stateVersion = "25.11";
}
