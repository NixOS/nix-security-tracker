{
  config,
  pkgs,
  ...
}:
let
  sources = import ../npins;
in
{
  imports = [
    "${sources.agenix}/modules/age.nix"
    ./keys.nix
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
  users.users.root = {
    # FIXME(@fricklerhandwerk): Don't give everyone root.
    # Wire the users to have the right permissions for doing what they need.
    openssh.authorizedKeys.keyFiles = with config.custom.keys; [
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
      queries = import ./sql-exporter-queries.nix;
      connections = [ "postgres://postgres@/nix-security-tracker?host=/run/postgresql" ];
      interval = "1h";
    };
  };

  system.stateVersion = "24.05";
}
