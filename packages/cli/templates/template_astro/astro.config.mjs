// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import path from "node:path";

const __dirname = new URL(".", import.meta.url).pathname;

// https://astro.build/config
export default defineConfig({
    output: "server",
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
