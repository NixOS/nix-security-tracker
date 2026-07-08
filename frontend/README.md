# Frontend ([Preact](https://preactjs.com/) / [Vite](https://vite.dev/) UI)

The new frontend for the Nixpkgs security tracker, served at `/ui-v2/`.
It coexists with the existing Django-rendered views.

## Development

Install the dependencies with `npm install`.

Either start the whole dev stack (Django, workers, and the Vite dev server) with `hivemind` or just the Vite dev server with `npm run dev`

Django serves the page at <http://127.0.0.1:8000/ui-v2/> and [django-vite](https://github.com/MrBin99/django-vite) injects the Vite dev server's assets for hot-reload.
In production it reads Vite's built `manifest.json` serves built assets: no separate dev server.

## API client generation ([Orval](https://orval.dev/))

The [TanStack Query](https://tanstack.com/query) client in `src/api/generated/` is generated (and gitignored) from the OpenAPI schema using Orval.
The schema is the single source of truth. Regenerate it when the API changes.

From the live schema (with Django running) run `npm run generate-api`.

The schema is [fixed up before it's generated](./orval-transformer.ts).
Ideally, this should remain as small as possible and the API improved in the backend.
