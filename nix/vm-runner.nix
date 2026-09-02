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
      options.virtualisation.sharedDirectories = lib.mkOption {
        type = lib.types.attrsOf (
          lib.types.submodule {
            options.ensure-exists = lib.mkOption {
              type = lib.types.bool;
              default = false;
              description = "Create the source directory on the host before the VM starts";
            };
          }
        );
      };

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
        mapped-users = lib.mkOption {
          type = lib.types.listOf lib.types.str;
          default = [ ];
          description = ''
            Guest users where the UID is aligned to the host user launching the VM

            This presents the shared directories owned by the host users as owned by the guest user, to avoid surprising permission issues.
          '';
        };
      };

      config = {
        virtualisation.forwardPorts = lib.mapAttrsToList (_: port: {
          from = "host";
          host.port = port + config.local.port-offset;
          guest.port = port;
        }) config.local.ports;

        system.activationScripts.align-host-uid = {
          deps = [ "users" ];
          text = ''
            for param in $(cat /proc/cmdline); do
              case $param in
                host_uid=*)
                  uid="''${param#host_uid=}"
                  ${lib.concatMapStrings (user: ''
                    usermod -u "$uid" ${lib.escapeShellArg user}
                  '') config.local.mapped-users}
                  ;;
              esac
            done
          '';
        };

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
    ${lib.concatStrings (
      lib.mapAttrsToList (
        _: dir:
        lib.optionalString dir.ensure-exists ''
          mkdir -p ${lib.escapeShellArg dir.source}
        ''
      ) cfg.virtualisation.sharedDirectories
    )}

    QEMU_KERNEL_PARAMS="host_uid=$(id -u)"
    export QEMU_KERNEL_PARAMS
    exec "${vm}/bin/run-${hostname}-vm"
  '';
}
