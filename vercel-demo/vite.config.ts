import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("../vercel-static", import.meta.url)),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
});
