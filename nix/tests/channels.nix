/**
  Example of a subset of the structure as it comes out of https://prometheus.nixos.org/api/v1/query?query=channel_revision
*/
{
  status = "success";
  data = {
    resultType = "vector";
    result = [
      {
        metric = {
          __name__ = "channel_revision";
          channel = "nixos-unstable";
          revision = "@commit@";
          status = "rolling";
          variant = "primary";
        };
      }
      {
        metric = {
          __name__ = "channel_revision";
          channel = "nixpkgs-unstable";
          revision = "@commit@";
          status = "rolling";
        };
      }
      {
        metric = {
          __name__ = "channel_revision";
          channel = "nixos-25.11";
          revision = "@commit@";
          status = "stable";
          variant = "primary";
        };
      }
      {
        metric = {
          __name__ = "channel_revision";
          channel = "nixos-25.05-small";
          revision = "@commit@";
          status = "unmaintained";
          variant = "small";
        };
      }
    ];
  };
}
