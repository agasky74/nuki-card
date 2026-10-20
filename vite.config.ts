import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  esbuild: {
    // Lit setters live on the prototype. Emitting class fields would shadow them.
    tsconfigRaw: {
      compilerOptions: {
        useDefineForClassFields: false,
      },
    },
  },
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    lib: {
      entry: "src/nuki-lock-card.ts",
      formats: ["es"],
      fileName: () => "nuki-card.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        banner: "/* nuki-card v1 — Nuki Smart Lock Pro (5th gen) Lovelace card */",
      },
    },
  },
});
