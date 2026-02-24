# Contributing Guide

This document is for anyone wanting to contribute to the implementation of the security tracker.

## Overview

This file contains general contribution information, but the other directories in this repository have additional `README.md` files with more specific information relevant to their sibling files:

# Hacking

The service is implemented in Python using [Django](https://www.djangoproject.com/).

## Formatting

A formatter is run on each pull request and as a pre-push Git hook.

Run the formatter manually with:

```console
nix-shell --run format
```

## Tagged comments

We use these tagged comments inspired by and loosely following [PEP 450](https://peps.python.org/pep-0350/#mnemonics):

- `TODO` - Unfinished change, should not occur in production

  We haven't adopted this pattern from the start, so there are still many `TODO`s that should be `FIXME`s.
  Please only replace instances when touching the respective code.

  ```
  # FIXME(@fricklerhandwerk): Remove the above note when the last instance of `TODO` is gone.
  ```

- `FIXME` - Known bad practice or hack, but too expensive or of questionable value to fix at the moment

  We use this to communicate to readers of the code where careful improvements are welcome, but weren't considered critical at the time of writing and thus won't be tracked as an issue.
  We only use issues to track desired changes to behavior observable by users.

- `XXX` - Explanation for why unusual code is the way it is

  We use this to ask readers for extra attention to code that may be surprising but shouldn't be changed without particular care.

  We haven't adopted this pattern from the start, so there are still some `NOTE`s that should be `XXX`s.
  Please only replace instances when touching the respective code.

  ```
  # FIXME(@fricklerhandwerk): Remove the above note when the last instance of `NOTE` is gone.
  ```

Always add your GitHub handle in parentheses -- `(@<author>)` -- so it's clear who had an opinion and may still have one during review.
Code may move around, so [`git blame`](https://git-scm.com/docs/git-blame) won't be useful to track comment authorship.

## Setting up credentials

The service connects to GitHub on startup, in order to manage permissions according to GitHub team membership in the configured organisation.

<details><summary>Create a Django secret key</summary>

```console
python3 -c 'import secrets; print(secrets.token_hex(100))' > .credentials/SECRET_KEY
```

</details>

<details><summary>Set up GitHub authentication</summary>

1.  Create a new or select an existing GitHub organisation to associate with the Nixpkgs security tracker.

    We're using <https://github.com/Nix-Security-WG> for development.
    - In the **Settings** tab under **Personal access tokens**, ensure that personal access tokens are allowed.
    - In the **Teams** tab, ensure there are at two teams for mapping user permissions.
      They will correspond to [`nixpkgs-committers`](https://github.com/orgs/nixos/teams/nixpkgs-committers) and [`security`](https://github.com/orgs/nixos/teams/security).
    - In the **Repositories** tab, ensure there's a repository for posting issues.
      It will correspond to [`nixpkgs`](https://github.com/nixos/nixpkgs).
      In the **Settings** tab on that repository, in the **Features** section, ensure that _Issues_ are enabled.

2.  In the GitHub organisation settings configure the GitHub App

    We're using <https://github.com/apps/sectracker-testing> for local development and <https://github.com/apps/sectracker-demo> for the public demo deployment.
    [Register a new GitHub application](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app) if needed.
    - In **Personal access tokens** approve the request under **Pending requests** if approval is required
    - In **GitHub Apps**, go to **Configure** and then **App settings** (top row). Under **Permissions & events** (side panel):
      - In **Repository Permissions** select **Administration (read-only)**, **Issues (read and write)**, and **(Metadata: read-only)**.
      - In **Organization Permissions** select **Administration (read-only)** and **(Members: read-only)**.

      Store the **Client ID** in `.credentials/GH_CLIENT_ID`

    - In the application settings / **General** / **Generate a new client secret**

      Store the value in `.credentials/GH_SECRET`

    - In the application settings / **General** / **Private keys** / **Generate a private key**

      Store the value in `.credentials/GH_APP_PRIVATE_KEY`

    - In the application settings / **Install App**

      Make sure the app is installed in the correct organisation's account.

      <details><summary>If the account that shows up is your Developer Account</summary>

      In the application settings / **Advanced**
      - **Transfer ownership of this GitHub App** to the organisation account.

      </details>

    - In organisation settings under **GitHub Apps** / **Installed GitHub Apps** / **<GH_APP_NAME>** / **Configure** page

      Check the URL, which has the pattern `https://github.com/organizations/<ORG_NAME>/settings/installations/<INSTALLATION_ID>`.

      Store the value **<INSTALLATION_ID>** in `.credentials/GH_APP_INSTALLATION_ID`.

</details>

<details><summary>Set up Github App webhooks</summary>

For now, we require a GitHub webhook to receive push notifications when team memberships change.
To configure the GitHub app and the webhook in the GitHub organisation settings:

- In **Code, planning, and automation** Webhooks, create a new webhook:
  - In **Payload URL**, input "https://<APP_DOMAIN>/github-webhook".
  - In **Content Type** choose **application/json**.
  - Generate a token and put in **Secret**. This token should be in `./credentials/GH_WEBHOOK_SECRET`.
  - Choose **Let me select individual events**
    - Deselect **Pushes**.
    - Select **Memberships**.

</details>

## Running the service in a development environment

Start a development shell:

```console
nix-shell
```

Or set up [`nix-direnv`](https://github.com/nix-community/nix-direnv) on your system and run `direnv allow` to enter the development environment automatically when entering the project directory.

### Set up a local database

Currently only [PostgreSQL](https://www.postgresql.org/) is supported as a database.
Assuming you have a local checkout of this repository at `~/src/nix-security-tracker`, in your NixOS configuration, add the following entry to `imports` and rebuild your system:

```nix
{ ... }:
{
  imports = [
    (import ~/src/nix-security-tracker { }).dev-setup
  ];

  nix-security-tracker-dev-environment = {
    enable = true;
    # The user you run the backend application as, so that you can access the local database
    user = "myuser";
  };
}
```

### Start the service

The service is comprised of the Django server and workers for ingesting CVEs and derivations.
What needs to be run is defined in the [`Procfile`](../Procfile) managed by [hivemind](https://github.com/DarthSim/hivemind).

Run everything with:

```bash
hivemind
```

### Resetting the database

In order to start over you need SSH [access to the staging environment](./infra/README.md#adding-ssh-keys).
Tools for the following are available in the development shell.
Delete the database and recreate it, then restore it from a dump, and (just in case the dump is behind the code) run migrations:

```bash
dropdb nix-security-tracker
ssh root@tracker-staging.security.nixos.org "sudo -u postgres pg_dump --create nix-security-tracker | zstd" | zstdcat | pv | psql
manage migrate
```

## Running the service in a container

On NixOS, you can run the service in a [`systemd-nspawn` container](https://search.nixos.org/options?show=containers) to preview a deployment.

Assuming you have a local checkout of this repository at `~/src/nix-security-tracker`, in your NixOS configuration, add the following entry to `imports` and rebuild your system:

```nix
{ ... }:
{
  imports = [
    (import ~/src/nix-security-tracker { }).dev-container
    # ...
   ];
}
```

The service will be accessible at <http://172.31.100.1>.

## Running tests

Run integration tests:

```console
nix-build -A tests
```

Interact with the involved virtual machines in a test:

```
$(nix-build -A tests.driverInteractive)/bin/nixos-test-driver
```

## Changing the database schema

Whenever you add a field in the database schema, run:

```console
manage makemigrations
```

Then before starting the server again, run:

```
manage migrate
```

This is the default Django workflow.

## Manual ingestion

### CVEs

Add 100 CVE entries to the database:

```console
manage ingest_bulk_cve --subset 100
```

This will take a few minutes on an average machine.
Not passing `--subset N` will take about an hour and produce ~500 MB of data.

### Caching suggestions

Suggestion contents are displayed from a cache to avoid latency from complex database queries.

To compute or re-compute the cached information from scratch:

```console
manage regenerate_cached_suggestions
```

## Staging deployment

See [infra/README.md](infra/README.md#Deploying-the-Security-Tracker).

## Operators guidance

### Using a Sentry-like collector

Sentry-like collectors are endpoints where we ship error information from the Python application with its stack-local variables for all the traceback, you can use [Sentry](https://sentry.io/welcome/) or [GlitchTip](https://glitchtip.com/) as a collector.

Collectors are configured using [a DSN, i.e. a data source name.](https://docs.sentry.io/concepts/key-terms/dsn-explainer/) in Sentry parlance, this is where events are sent to.

You can set `GLITCHTIP_DSN` as a credential secret with a DSN and this will connect to a Sentry-like endpoint via your DSN.

# Styling

This project uses plain CSS with a utility-class approach. Utility classes make it possible to reuse sec-traker's existing UI elements without needing contributors to write any css.
Rather than styling semantic classes, utility classes refer to UI elements directly.
E.g. `rounded-box` for a standard container with rounded corners that we reuse across the project.
Flex containers are use extensively as they are versatile and responsive.
E.g `row` + `gap` + `center` to organize elements on a row, separated by gaps of the same standard size, and centered vertically.

This design gives us a simple UI language that is easy to deploy and consistent (consistent colors, space sizes, etc).

## Architecture

The CSS is organized into multiple CSS files, in `src/webview/static`, that are loaded in `src/shared/templates/base.html`. Consult each one for role and documentation. `utility.css` should contain all the classes you need for html templates.

## Icons

Icons rely on a custom icomoon webfont and class definitions to be used with the `<i>` tag. Consult [src/webview/static/icons/README.md] for details.

## Adding New Styles

Adding new styles should be a last resort:

1. **Check existing utilities first in utility.css** - Reusing what exists is what guarantees UI consistency and mainainability
2. **Add to utility.css** - If it's a real new and reusable pattern, add it as a utility class
3. **Use consistent naming** - Follow the existing naming conventions
4. **Document new utilities** - Update this guide if adding significant new patterns
