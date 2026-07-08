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

## Experimental UI

If you want to enable the new experimental UI, replace "Start the development server" with the following steps:

Install the dependencies:

```console
# From the `frontend` directory:
npm install
```

Start the development servers (Django and Vite):

```console
# From the root directory
hivemind
```

Generate the API client:

```console
# From the `frontend` directory:
npm run generate-api
```

The new UI is available at `http://127.0.0.1:8000/ui-v2`

## Next steps

In order to log in to the service with your GitHub account, [set up credentials](../CONTRIBUTING.md#setting-up-credentials).

Then try it out with real data by running [manual data ingestion and matching](./data_ingestion_and_matching.md).
