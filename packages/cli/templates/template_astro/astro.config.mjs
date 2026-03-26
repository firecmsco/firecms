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
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            }
        }
    },
});
