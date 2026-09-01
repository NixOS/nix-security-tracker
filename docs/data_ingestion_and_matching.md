# Working with data locally

This document shows how to fetch channels, run evaluations, ingest CVEs and produce untriaged matches on your local instance.

## Prerequisites

- Follow [Quickstart](./quickstart.md) to set up a running local instance with a database.

### Ingest Nixpkgs metadata

Fetch the tips of all [channel branches](https://nix.dev/concepts/faq#channel-branches):

```console
manage fetch_all_channels
```

The output will look like this:

```console
{'channel': 'nixos-25.11-small',
 'release_branch': 'release-25.11',
 'revision': 'c9bfd86ed684d27e63b0ff9ebb18699f84f27a3b',
 'status': NixChannel.ChannelState.END_OF_LIFE,
 'variant': NixChannel.Variant.SMALL}
{'channel': 'nixpkgs-25.11-darwin',
 'release_branch': 'release-25.11',
 'revision': '0921fdb3e13e40fe25fbc52b89661a9d6d32ac68',
 'status': NixChannel.ChannelState.END_OF_LIFE,
 'variant': NixChannel.Variant.DARWIN}
```

Select a `head_sha1_commit` from the output of `fetch_all_channels` command and run evaluation on that:

```console
manage run_evaluation <commit>
```

This would take 6-7G of memory and 20-30 min on reasonably modern machine.

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

Matching CVEs against Nixpkgs metadata is triggered by `pgpubsub` notifications internally as CVEs are ingested.
To test this dataflow locally, start the listeners:

```console
manage listen -v3 --recover
```

This will run in foreground and block this terminal.

Open a second terminal, enter development shell and Ingest some CVEs:

> [!NOTE]
> `ingest_bulk_cve` requires a configured GitHub App with access to `CVEProject/cvelistV5`.
> If you see `InvalidKeyError: Could not parse the provided public key`, your GitHub App private key is missing or misconfigured.
> [Set up GitHub credentials](../CONTRIBUTING.md#setting-up-credentials) in that case.

```console
manage ingest_bulk_cve --from 2026-01-01 --to 2026-01-31
```

This should produce untriaged matches.

### Offline matching training data

In order to measure matching algorithm accuracy locally when developing, you will need access to production data, which contains past automatic matches curated with corrections by users.
You need an [API token](https://tracker.security.nixos.org/ui-v2/user/tokens), and permissions to access the endpoint with your user account which you can request by [contacting maintainers](../README.md#contributing).

Fetch paginated user-curated matches.
Dump size is determined by number of automatically matched derivations (currently ca. 500k items).

```console
export MATCHING_TRAINING_DATA_TOKEN=<api-token>
manage fetch_matching_training_data \
  --base-url https://tracker.security.nixos.org \
  --output ./training-data/
```

`--output` must be an empty directory (the command refuses to overwrite existing files).
Use `--limit N` to fetch only a sample.

This will produce one JSON file per page fetched.

Import into your local database:

> [!WARNING]
> Do _not_ run `manage listen` during import.
> The command suppresses `pgpubsub` triggers so workers are not flooded with tasks.

```console
manage import_matching_training_data --input ./training-data/
```

Re-importing the same dump is idempotent per CVE ID.

Score the current matcher against those labels (read-only; does not create proposals):

```console
manage benchmark_matching
```

Reports true positives, false positives, and SNR vs kept derivations and ignored package overlays.
Prints one line per CVE by default.
Use `--quiet` for the summary only, and `--limit N` for a sample.

Remove a previously imported corpus:

```console
manage purge_matching_training_data
```
