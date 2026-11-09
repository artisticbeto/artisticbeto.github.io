import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      // fileURLToPath decodes %20 etc., so the alias works when the path has spaces
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
