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
    ./dump-db.nix
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
      adekoder
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
  # All this is Hetzner-specific (not machine-specific) and can be considered stable.
  networking.useDHCP = false;

  systemd.network = {
    enable = true;
    networks."10-wan" = {
      matchConfig.Name = "enp1s0";
      networkConfig.DHCP = "ipv4";
      routes = [
        # create default routes for both IPv6 and IPv4
        { Gateway = "fe80::1"; }
        # or when the gateway is not on the same network
        {
          Gateway = "172.31.1.1";
          GatewayOnLink = true;
        }
      ];
      # make the routes on this interface a dependency for network-online.target
      linkConfig.RequiredForOnline = "routable";
    };
  };

  system.stateVersion = "24.05";
}
