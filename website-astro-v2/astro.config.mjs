// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import path from "node:path";

// https://astro.build/config
export default defineConfig({
    site: "https://firecms.co",
    integrations: [
        react({
            experimentalReactChildren: true
        }),
        sitemap()
    ],
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                "@firecms/ui": path.resolve(new URL(".", import.meta.url).pathname, "../packages/ui")
            }
        },
        server: {
            fs: {
                allow: [path.resolve(new URL(".", import.meta.url).pathname, ".."), path.resolve(new URL(".", import.meta.url).pathname, ".")]
            }
        }
    },
});
