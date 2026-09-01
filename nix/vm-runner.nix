{
  lib,
  writeShellApplication,
  nixos,
  nixos-module,
}:
let
  runner-module =
    { config, ... }:
    {
      options.local = {
        ports = lib.mkOption {
          type = lib.types.attrsOf lib.types.port;
          default = { };
          description = "Named TCP ports to forward from the VM to the host";
        };
        port-offset = lib.mkOption {
          type = lib.types.port;
          description = "Added to each guest port number to derive the host port number";
        };
      };

      config = {
        virtualisation.forwardPorts = lib.mapAttrsToList (_: port: {
          from = "host";
          host.port = port + config.local.port-offset;
          guest.port = port;
        }) config.local.ports;

        programs.bash.loginShellInit = lib.optionalString (config.local.ports != { }) (
          ''
            echo "Services available on the host:"
          ''
          + lib.concatStrings (
            lib.mapAttrsToList (name: port: ''
              echo "  ${name}:"
              echo "    http://localhost:${toString (port + config.local.port-offset)}"
            '') config.local.ports
          )
        );
      };
    };

  nixos-config = nixos {
    imports = [
      nixos-module
      runner-module
    ];
  };

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
