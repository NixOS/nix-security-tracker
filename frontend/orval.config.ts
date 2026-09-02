import { defineConfig } from "orval";

export default defineConfig({
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
      clean: true,
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
