# Working with data locally

This document shows how to fetch channels, run evaluations, ingest CVEs and produce untriaged matches on your local instance.

## Prerequisites

- Follow [Quickstart](./quickstart.md) to set up a running local instance with a database.

### Ingest Nixpkgs metadata

1. Fetch the tips of all [channel branches](https://nix.dev/concepts/faq#channel-branches).

```console
manage fetch_all_channels
```

When running this command for first time, this would take a couple of minutes.
In the meantime you can watch some cat videos.
The output will look like this:

```console
{'channel_branch': 'nixos-25.05',
 'head_sha1_commit': 'ac62194c3917d5f474c1a844b6fd6da2db95077d',
 'release_branch': 'release-25.05',
 'state': NixChannel.ChannelState.END_OF_LIFE}
{'channel_branch': 'nixos-25.05-small',
 'head_sha1_commit': 'ac62194c3917d5f474c1a844b6fd6da2db95077d',
 'release_branch': 'release-25.05',
 'state': NixChannel.ChannelState.END_OF_LIFE}
```

2. Select a `head_sha1_commit` from the output of `fetch_all_channels` command and run evaluation on that:

```console
manage run_evaluation <commit>
```

This would take `6-7`G of memory and `20-30` min on reasonably modern machine.

This command _evaluates_ the Nix expression describing the Nixpkgs package collection at that commit, extracting their versions, maintainers, licenses, etc. into your local database.

Without this, there's nothing for CVEs to match against.

The output of this command will look something like this:

```console
DEBUG 2026-06-19 15:50:08,640 evaluation 62141 130663090386624 Skipping license without SPDX-ID: {
  "fullName": "Unfree",
  "deprecated": false,
  "free": false,
  "redistributable": false,
  "shortName": "unfree",
  "spdxId": null,
  "url": null
}
DEBUG 2026-06-19 15:50:08,640 evaluation 62141 130663090386624 Skipping license without SPDX-ID: {
  "fullName": "Unfree",
  "deprecated": false,
  "free": false,
  "redistributable": false,
  "shortName": "unfree",
  "spdxId": null,
  "url": null
}
DEBUG 2026-06-19 15:50:08,652 evaluation 62141 130663090386624 Parsed 0 maintainers and 107 licences for 22023 derivations in 1.985667 s
DEBUG 2026-06-19 15:50:08,652 evaluation 62141 130663090386624 Ingested 0 maintainers for 22023 derivations in 0.000060 s
```

### Start matching listeners and ingest CVEs for matching

1. Matching CVEs against Nixpkgs metadata is triggered by `pgpubsub` notifications internally as CVEs are ingested.
   To test this dataflow locally, start the listeners:

```console
manage listen -v3 --recover
```

This will run in foreground and block this terminal.

2. Open a second terminal, enter development shell and Ingest some CVEs:

> [!NOTE]
> `ingest_bulk_cve` requires a configured GitHub App with access to `CVEProject/cvelistV5`.
> If you see `InvalidKeyError: Could not parse the provided public key`, your GitHub App private key is missing or misconfigured.
> [Set up GitHub credentials](../CONTRIBUTING.md#setting-up-credentials) in that case.

```console
manage ingest_bulk_cve --from 2026-01-01 --to 2026-01-31
```

This should produce untriaged matches.
