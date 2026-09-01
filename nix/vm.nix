{
  modulesPath,
  config,
  ...
}:
{
  imports = [ (modulesPath + "/virtualisation/qemu-vm.nix") ];

  networking.hostName = "sectracker-local";

  services = {
    getty.autologinUser = "root";

    nginx = {
      enable = true;
      virtualHosts._.default = true;
    };
  };

  networking.firewall.allowedTCPPorts = [ config.services.nginx.defaultHTTPListenPort ];

  local = {
    port-offset = 50000;
    ports.nginx = config.services.nginx.defaultHTTPListenPort;
  };

  virtualisation.graphics = false;
  system.stateVersion = "24.05";
}
