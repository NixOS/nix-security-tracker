let
  layout = id: {
    type = "gpt";
    partitions = {
      esp = {
        type = "EF00";
        size = "2G";
        content = {
          type = "filesystem";
          format = "vfat";
          mountpoint = "/efi/${id}";
        };
      };
      zfs = {
        size = "100%";
        content = {
          type = "zfs";
          pool = "zroot";
        };
      };
    };
  };
in
{
  disko.devices = {
    disk = {
      nvme0n1 = {
        type = "disk";
        device = "/dev/disk/by-id/nvme-Micron_3500_MTFDKBA512TGD-1BK1AABYY_2402510D4488";
        content = layout "a";
      };
      nvme1n1 = {
        type = "disk";
        device = "/dev/disk/by-id/nvme-Micron_3500_MTFDKBA512TGD-1BK1AABYY_2402510D4596";
        content = layout "b";
      };
    };
    zpool.zroot = {
      type = "zpool";
      mode = "mirror";
      options.ashift = "12";

      rootFsOptions = {
        acltype = "posixacl";
        atime = "off";
        compression = "on";
        mountpoint = "none";
        xattr = "sa";
      };
      datasets = {
        "root" = {
          type = "zfs_fs";
          mountpoint = "/";
        };
        "nix/store" = {
          type = "zfs_fs";
          mountpoint = "/nix";
        };
        "nix/db" = {
          type = "zfs_fs";
          mountpoint = "/nix/var/nix/db";
        };
        "microvms" = {
          type = "zfs_fs";
          mountpoint = "/var/lib/microvms";
        };
        "microvms/sectracker" = {
          type = "zfs_volume";
          size = "200G";
          options.volblocksize = "16K";
          options.refreservation = "none";
        };
        "microvms/sectracker-staging" = {
          type = "zfs_volume";
          size = "150G";
          options.volblocksize = "16K";
          options.refreservation = "none";
        };
        "reserved" = {
          type = "zfs_fs";
          options = {
            canmount = "off";
            refreservation = "16G";
          };
        };
      };
    };
  };
}
