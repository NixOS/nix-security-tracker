# Quickstart

This document shows how to run the Nixpkgs security tracker running locally.

## Prerequisites

[Install Nix](https://nix.dev/install-nix) on your machine.

To run the service locally, your machine will need available at least:

- 2 cores
- 10G RAM
- 40G disk space

## Clone this repository

```shell
git clone https://github.com/nixos/nix-security-tracker
cd nix-security-tracker
```

## Verify your setup

Enter the development shell:

```console
nix-shell
```

Start the system in a virtual machine:

```console
vm
```

On login all web services accessible from your host will be displayed.

Exit the virtual machine with the `poweroff` command.

## Next steps

- In order to log in to the service with your GitHub account, [set up credentials](../CONTRIBUTING.md#setting-up-credentials).
- Try working with real data by running [manual data ingestion and matching](./data_ingestion_and_matching.md).
- [Start hacking](./hacking.md) by making and testing local changes in your virtual machine
