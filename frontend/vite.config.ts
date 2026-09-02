import path from "node:path";
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [preact()],
  base: "/static/vite/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: "src/main.tsx",
    },
  },
});
