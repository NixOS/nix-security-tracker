{
  config,
  lib,
  pkgs,
  ...
}:
let
  inherit (lib) mkOption types;
  cfg = config.custom.dump-db;
in
{
  options.custom.dump-db = {
    authorizedKeyFiles = mkOption {
      type = types.listOf types.path;
      default = [ ];
      description = ''
        Public key files whose owners can fetch a compressed database dump over SSH.
        Each key is installed with a forced command and the `restrict` option; no other action is possible with the key.
      '';
    };
  };

  config = {
    users.users.dump-db = {
      isSystemUser = true;
      group = "dump-db";
      shell = pkgs.bashInteractive;
      openssh.authorizedKeys.keys =
        let
          command = "pg_dump -U postgres --create nix-security-tracker | zstd";
          # Escaping rules: sshd(8) AUTHORIZED_KEYS FILE FORMAT command="command"
          ssh-quote = lib.replaceStrings [ ''\'' ''"'' ] [ ''\\'' ''\"'' ];
          restrict-key = key: ''restrict,command="${ssh-quote command}" ${key}'';
        in
        map (file: restrict-key (builtins.readFile file)) cfg.authorizedKeyFiles;
    };
    users.groups.dump-db = { };
  };
}
