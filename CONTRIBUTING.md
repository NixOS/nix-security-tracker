# Contributing guide

This document is for anyone wanting to contribute to the implementation of the security tracker.

## Overview

This document is for anyone wanting to contribute to the implementation of the security tracker.
It contains general contribution information, and lists resources to help you get started:

- [**Architecture Overview**](docs/README.md): High-level system design and component interaction.
- [**Architecture Diagram**](docs/architecture.mermaid): Visual representation of the system (Mermaid source).
- [**Design Documents**](docs/design/): Detailed design specifications for individual features (E.g., linkage).

Other directories in this repository have additional `README.md` files with more specific information relevant to their sibling files.

Service definitions are in [`nix/configuration.nix`](nix/configuration.nix).

Application logic lives in the [`src/`](src/) directory.
From here, it follows standard Django patterns:

- [`src/project/`](src/project/): global project configuration
- [`src/shared/`](src/shared/): [application](https://docs.djangoproject.com/en/6.0/ref/applications/) with data models and business logic
- [`src/webview/`](src/webview/): application for the web frontend

# Hacking

The service is implemented in Python using [Django](https://www.djangoproject.com/).
It is built and deployed with [Nix](https://nix.dev).

To get going, all you need is to [install Nix](https://nix.dev/install-nix).

## Running the service in a development environment

Start a development shell:

```console
nix-shell
```

This will provide most of tools necessary to run the service locally.

> [!NOTE]
> If you want to start the development environment automatically when entering the project directory, set up [`nix-direnv`](https://github.com/nix-community/nix-direnv) on your system.
> Add your `.envrc` to `.git/info/exclude`.

List all available [management commands](https://docs.djangoproject.com/en/6.0/ref/django-admin/):

```console
manage help
```

## Formatting

A formatter is run on each pull request and as a pre-push Git hook.

Run the formatter manually with:

```console
nix-shell --run format
```

## Contribution culture

A pull request asks maintainers to accept responsibility for a decision.
Help them understand what they're agreeing to.

To minimise turnaround time for getting your contribution merged:

- Make exactly one change in each pull request.

  Don't lump together unrelated changes.
  Otherwise, easy parts that could be merged on their own get blocked by the harder ones that need multiple iterations to get right.

- Always add tests when changing behavior or fixing bugs.

  Ideally, start by adding tests.

  Even contributions that consist entirely of new tests annotated with `@pytest.mark.xfail(reason="Not implemented")` are welcome!
  This is a good way of formalising requirements to be implemented in the future.

- Use the commit message title to describe the change such that its merit can be evaluated.
  - Good: `fix: race condition during ingestion`
  - Bad: `fix: add with transaction.atomic() in ingestion.py`

- If the change is not trivial, explain _why_ the change is made in the pull request description and commit message.

  Also describe consequences of the change if they aren't obvious.

  Empty pull request descriptions and commit messages are fine if rationale and impact are evident from the title.

- Strive to keep the diff small.

  Larger changes typically mean that you made too many changes at once.
  Exceptions are mechanical changes that can be checked at a glance or reproduced by running a command.

- Don't rewrite history, address review comments in new commits.

  The pull request should still amount to a small change, and commits can be squashed before merging.

- Run `nix-shell --run format` and `nix-build -A tests` before pushing.

If you want to accept fixups by maintainers, [make your fork writeable](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork#enabling-repository-maintainer-permissions-on-existing-pull-requests).
This allows for last-minute changes or resolving merge conflicts without your involvement.

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

## Working with the database

You will need a local instance of the database to run tests and experiment manually.

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

To replicate this on a traditional Unix-like system:

- Inspect the [local database configuration](./nix/dev-setup.nix)
- Read the documentation on the respective module options for the general idea, e.g. [`services.postgresql.ensureDatabases`](https://search.nixos.org/options?query=postgresql.ensureDatabases)
- Search the linked module source for the option names for implementation details, e.g. [`postgresql.nix`](https://github.com/NixOS/nixpkgs/blob/master/nixos/modules/services/databases/postgresql.nix)

### Start the service

> ![NOTE]
> For a quick start, create dummy credentials:
>
> ```console
> dummy-credentials
> ```
>
> Logging in and publishing issues requires [setting up credentials](#setting-up-credentials).

Run the server:

```console
manage runserver
```

### Ingest Nixpkgs metadata

Fetch the tips of all [channel branches](https://nix.dev/concepts/faq#channel-branches):

```console
manage fetch_all_channels
```

Select a ``head_sha1_commit` from the output and run evaluation on that:

```console
manage run_evaluation <commit>
```

### Start matching listeners and ingest CVEs for matching

Matching CVEs against Nixpkgs metadata is triggered by `pgpubsub` notifications internally as CVEs are ingested.
To test this dataflow locally, start the listeners:

```console
manage listen -v3 --recover
```

Ingest some CVEs:

```console
manage ingest_bulk_cve --from 2024-01-01 --to 2024-01-31
```

This should produce untriaged matches.

### Resetting the database

In order to start over you need SSH [access to the staging environment](./infra/README.md#adding-ssh-keys).
Tools for the following are available in the development shell.
Delete the database and recreate it, then restore it from a dump, and (just in case the dump is behind the code) run migrations:

```bash
dropdb nix-security-tracker
ssh root@tracker-staging.security.nixos.org "sudo -u postgres pg_dump --create nix-security-tracker | zstd" | zstdcat | pv | psql
manage migrate
```

## Setting up credentials

The service connects to GitHub for certain operations:

- Managing permissions according to GitHub team membership in the configured organisation
- Publishing vulnerabilities as GitHub issues

This requires setting up GitHub credentials.

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

## `pgpubsub` listener registration pattern

The application uses [`django-pgpubsub`](https://github.com/PaulGilmartin/django-pgpubsub) to react to database changes asynchronously.
Listeners are defined as functions decorated with `@pgpubsub.post_insert_listener`, `@pgpubsub.post_update_listener` etc., and are primarily located in the [`src/shared/listeners/`](src/shared/listeners/) directory.

To ensure your listener is proactively registered when the Django application starts, its containing module must be imported.
We use the following pattern:

1. Create or edit a listener module in [`src/shared/listeners/`](src/shared/listeners/) (E.g., `src/shared/listeners/my_new_listener.py`).
2. Import the module inside [`src/shared/listeners/__init__.py`](src/shared/listeners/__init__.py) so it's loaded as part of the package:

   ```python
   # inside src/shared/listeners/__init__.py
   import shared.listeners.my_new_listener  # noqa
   ```

3. [`src/shared/apps.py`](src/shared/apps.py) triggers these imports in its `ready()` method by importing `shared.listeners`, registering all listeners upon app initialization.

> [!WARNING]
> If you create a new listener module but forget to add its import to [`src/shared/listeners/__init__.py`](src/shared/listeners/__init__.py), your listener will fail to run silently!

## Re-caching suggestions

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

## Adding new styles

Adding new styles should be a last resort:

1. **Check existing utilities first in utility.css** - Reusing what exists is what guarantees UI consistency and mainainability
2. **Add to utility.css** - If it's a real new and reusable pattern, add it as a utility class
3. **Use consistent naming** - Follow the existing naming conventions
4. **Document new utilities** - Update this guide if adding significant new patterns
