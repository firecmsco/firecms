// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import node from "@astrojs/node";
import path from "node:path";

const __dirname = new URL(".", import.meta.url).pathname;

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: node({
      mode: "standalone"
    }),
    integrations: [
        react({
            experimentalReactChildren: true
        })
    ],
    vite: {
        plugins: [
            tailwindcss()
        ],
        // Without this, `astro dev` serves @astrojs/react's client renderer unbundled while
        // react-dom is pre-bundled, so the island's `react-dom/client` import resolves to the
        // untransformed CommonJS file: "does not provide an export named 'createRoot'", and
        // every page renders blank. The production build is unaffected.
        optimizeDeps: {
            include: ["react-dom/client"]
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            }
        }
    },
});
