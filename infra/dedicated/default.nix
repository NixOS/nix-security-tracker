_:
let
  sources = import ../../npins;
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
    prometheus.enable = true;
    victorialogs = {
      enable = true;
    };
    zfs.autoScrub.enable = true;
  };

  system.stateVersion = "25.11";
}
