# Contributing guide

This document is for anyone wanting to contribute to the implementation of the Nixpkgs security tracker.

## Overview

Resources to help you get started:

- [**Quickstart guide**](./docs/quickstart.md): Set up a database, run the service locally.
- [**Manual data ingestion and matching**](./docs/data_ingestion_and_matching.md): Ingest Nixpkgs metadata and CVEs into your local instance.
- [**Hacking guide**](./docs/hacking.md): Common workflows for interacting with the development environment.
- [**Style guide**](./docs/styleguide.md): Tips for getting your change merged
- [**Architecture Overview**](docs/README.md): High-level system design and component interaction.
- [**Architecture Diagram**](docs/architecture.mermaid): Visual representation of the system (Mermaid source).
- [**Design Documents**](docs/design/): Detailed design specifications for individual features.
- [**CVE records**](./docs/cve_records.md): What the tracker stores for each CVE.

## Directory structure

Application logic lives in the [`src/`](src/) directory.
From here, it follows standard Django patterns:

- [`src/project/`](src/project/): global project configuration
- [`src/shared/`](src/shared/): [application](https://docs.djangoproject.com/en/6.0/ref/applications/) with data models and business logic
- [`src/api`](src/api): application for the REST API
- [`src/webview/`](src/webview/): application for the legacy web frontend

Web client code (currently in beta) lives [`frontend/`](frontend/) and relies on the API.

Service definitions are in [`nix/configuration.nix`](nix/configuration.nix).

Other directories in this repository have additional `README.md` files with more specific information relevant to their sibling files.

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

    - In the application settings / **General** / **Identifying and authorizing users**

      Set the callback URL to the one through which the service will be accessed.

      > [!TIP]
      > For local development, use https://127.0.0.1:8000 since that is what `manage runserver` will output.

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
