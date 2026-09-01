{
  writeShellApplication,
  nixos,
  nixos-module,
}:
let
  nixos-config = nixos { imports = [ nixos-module ]; };
  cfg = nixos-config.config;
  vm = cfg.system.build.vm;
  hostname = cfg.networking.hostName;
in
writeShellApplication {
  name = "run-vm";
  text = ''
    exec "${vm}/bin/run-${hostname}-vm"
  '';
}
