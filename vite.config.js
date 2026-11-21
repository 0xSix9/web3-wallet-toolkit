import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Keep the runnable example grouped under 01-demo.
  root: path.resolve(projectRoot, "01-demo"),

  // .env remains in the repository root, alongside .env.example.
  envDir: projectRoot,

  build: {
    // Keep production output at the repository root.
    outDir: path.resolve(projectRoot, "dist"),
    emptyOutDir: true,
  },
});
