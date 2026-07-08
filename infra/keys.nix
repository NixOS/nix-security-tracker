{ lib, ... }:
let
  inherit (lib) mkOption types;
in
{
  options.custom.keys = mkOption {
    type = with types; attrsOf path;
    default = with lib; mapAttrs (n: _: ./keys/${n}) (builtins.readDir ./keys);
    readOnly = true;
  };
}
