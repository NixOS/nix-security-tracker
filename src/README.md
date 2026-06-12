# Architecture

The Nix security tracker is implemented in the Django framework.

In addition to the `manage.py` administration utility, there are top-level directories here:

- [`project`](./project/): Configuration for the web server running the project.
- [`api`](./api/): Our REST API powered by Django REST framework (OpenAPI schema served on `/api/schema`)
- [`feeds`](./feeds/): Atom feeds
- [`shared`](./shared/): Utilities and models consumed by the other components.
- [`webview`](./webview/): The views which comprise the web frontend.
