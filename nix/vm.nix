{ modulesPath, ... }:
{
  imports = [ (modulesPath + "/virtualisation/qemu-vm.nix") ];

  networking.hostName = "sectracker-local";
  services.getty.autologinUser = "root";
  virtualisation.graphics = false;
  system.stateVersion = "24.05";
}
