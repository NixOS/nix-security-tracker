# Quickstart

This document shows how to run the Nixpkgs security tracker running locally.

## Prerequisites

- [Install Nix](https://nix.dev/install-nix)
- [Clone this repository](#clone-this-repository)
- [Set up a local database](../CONTRIBUTING.md#set-up-a-local-database)
- [Verify your setup](#verify-your-setup)

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

Apply database migrations:

```console
manage migrate
```

Start the development server:

```console
manage runserver
```

Check that the service has started:

```console
open http://127.0.0.1:8000
```

## Next steps

In order to log in to the service with your GitHub account, [set up credentials](../CONTRIBUTING.md#setting-up-credentials).
