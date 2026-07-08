import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "http://127.0.0.1:8000/api/schema/",
      override: {
        transformer: "./orval-transformer.ts",
      },
    },
    output: {
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/models",
      client: "react-query",
      mode: "split",
      override: {
        mutator: {
          path: "./src/api/client.ts",
          name: "apiFetch",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
  // Use this config when generating from a local schema file (offline/CI).
  // Run with: npx orval --config orval.config.ts --key api-local
  "api-local": {
    input: {
      target: "./schema.yaml",
      override: {
        transformer: "./orval-transformer.ts",
      },
    },
    output: {
      target: "./src/api/generated/endpoints.ts",
      schemas: "./src/api/generated/models",
      client: "react-query",
      mode: "split",
      override: {
        mutator: {
          path: "./src/api/client.ts",
          name: "apiFetch",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
