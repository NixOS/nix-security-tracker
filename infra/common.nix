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

  networking.useDHCP = false;
}
