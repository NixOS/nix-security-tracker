{ pkgs, lib, ... }:
let
  sources = import ../npins;
in
{
  imports = [
    "${sources.agenix}/modules/age.nix"
  ];

  boot = {
    loader.grub = {
      enable = true;
      device = "/dev/sda";
    };
    initrd.availableKernelModules = [
      "ahci"
      "xhci_pci"
      "virtio_pci"
      "virtio_scsi"
      "sd_mod"
      "sr_mod"
      "ext4"
    ];
  };

  nix.settings.experimental-features = [
    "nix-command"
    "flakes"
  ];

  # Propagate `inputs` everywhere in our NixOS module signatures.
  _module.args.inputs = {
    inherit sources;
  };

  zramSwap.enable = true;
  security.sudo.wheelNeedsPassword = false;

  services = {
    openssh = {
      enable = true;
      settings.PasswordAuthentication = false;
    };
    qemuGuest.enable = true;
  };

  users.mutableUsers = false;
  users.users.root =
    let
      keys = with lib; mapAttrs (n: _: ./keys/${n}) (builtins.readDir ./keys);
    in
    {
      openssh.authorizedKeys.keyFiles = with keys; [
        fricklerhandwerk
        erethon
        security-tracker-gh-actions
      ];
      # We're using both keys and keyFiles here in order to keep some alignment
      # with github:nixos/infra
      openssh.authorizedKeys.keys = (import "${sources.infra}/keys.nix").ssh.groups.infra;
    };

  environment.systemPackages = with pkgs; [
    curl
    file
    git
    htop
    lsof
    nano
    openssl
    pciutils
    pv
    tmux
    tree
    unar
    vim-full
    wget
    zip
  ];

  # Lifted from https://github.com/NixOS/nixos-wiki-infra/blob/ac9dfe854f748bf8acedf394750d404aaa8dd075/targets/nixos-wiki.nixos.org/configuration.nix#L40
  # and https://wiki.nixos.org/wiki/Install_NixOS_on_Hetzner_Cloud#Network_configuration
  systemd.network.enable = true;

  services.prometheus.exporters.node = {
    enable = true;
    openFirewall = true;
  };

  services.prometheus.exporters.postgres = {
    enable = true;
    openFirewall = true;
  };

  services.prometheus.exporters.sql = {
    enable = true;
    openFirewall = true;
    configuration.jobs.sectracker = {
      queries = {
        users = {
          query = "select count(*) from auth_user;";
          values = [ "count" ];
        };
        delta = {
          query = "select extract(EPOCH from timestamp) AS unix_timestamp from shared_cveingestion where delta = 't' order by timestamp desc limit 1;";
          values = [ "unix_timestamp" ];
        };
        matching = {
          query = "select extract(EPOCH from created_at) AS unix_timestamp from shared_cvederivationclusterproposal order by created_at desc limit 1;";
          values = [ "unix_timestamp" ];
        };
        cves = {
          query = "select count(*) from shared_cverecord where state='PUBLISHED';";
          values = [ "count" ];
        };
        derivations = {
          query = "select count(*) from shared_nixderivation;";
          values = [ "count" ];
        };
        evaluations = {
          query = "select count(*) from shared_nixevaluation;";
          values = [ "count" ];
        };
        issues = {
          query = "select count(*) from shared_nixpkgsissue;";
          values = [ "count" ];
        };
        suggestions = {
          query = "select count(*) from shared_cvederivationclusterproposal;";
          values = [ "count" ];
        };
        suggestions_pending = {
          query = "select count(*) from shared_cvederivationclusterproposal where status='pending';";
          values = [ "count" ];
        };
        suggestions_rejected = {
          query = "select count(*) from shared_cvederivationclusterproposal where status='rejected';";
          values = [ "count" ];
        };
        suggestions_accepted = {
          query = "select count(*) from shared_cvederivationclusterproposal where status='accepted';";
          values = [ "count" ];
        };
        # this should be the same as `issues` above, but adding a single metric
        # with low cardinality is very cheap so let's add it for completeness
        suggestions_published = {
          query = "select count(*) from shared_cvederivationclusterproposal where status='published';";
          values = [ "count" ];
        };
        channel_evaluation_status = {
          help = "Per-channel latest and latest-successful Nix evaluation status";
          labels = [
            "channel"
            "channel_head"
            "latest_state"
            "latest_commit"
            "latest_successful_commit"
          ];
          values = [
            "latest_updated"
            "latest_elapsed"
            "latest_successful_updated"
          ];
          query = "
            WITH latest AS (
              SELECT DISTINCT ON (channel_id)
                channel_id, state, commit_sha1, updated_at, elapsed
              FROM shared_nixevaluation
              ORDER BY channel_id, updated_at DESC
            ),
            latest_successful AS (
              SELECT DISTINCT ON (channel_id)
                channel_id, commit_sha1, updated_at
              FROM shared_nixevaluation
              WHERE state = 'COMPLETED'
              ORDER BY channel_id, updated_at DESC
            )
            SELECT
              c.channel_branch::text AS channel,
              c.head_sha1_commit::text AS channel_head,
              COALESCE(l.state, '')::text AS latest_state,
              COALESCE(l.commit_sha1, '')::text AS latest_commit,
              COALESCE(extract(epoch FROM l.updated_at) * 1000, 0)::float AS latest_updated,
              COALESCE(l.elapsed, 0)::float AS latest_elapsed,
              COALESCE(s.commit_sha1, '')::text AS latest_successful_commit,
              COALESCE(extract(epoch FROM s.updated_at) * 1000, 0)::float AS latest_successful_updated
            FROM shared_nixchannel c
            LEFT JOIN latest l ON l.channel_id = c.channel_branch
            LEFT JOIN latest_successful s ON s.channel_id = c.channel_branch
            WHERE c.state IN ('DEPRECATED', 'BETA', 'STABLE', 'UNSTABLE')
            ORDER BY c.channel_branch
          ";
        };
      };
      connections = [ "postgres://postgres@/nix-security-tracker?host=/run/postgresql" ];
      interval = "1h";
    };
  };

  system.stateVersion = "24.05";
}
