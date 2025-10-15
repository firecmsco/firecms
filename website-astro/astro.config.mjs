// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "FireCMS Docs",
            social: [{
                icon: "github",
                label: "GitHub",
                href: "https://github.com/withastro/starlight"
            }],
            sidebar: [
                {
                    label: "Guides",
                    items: [
                        {
                            label: "Example Guide",
                            slug: "guides/example"
                        },
                    ],
                },
                {
                    label: "Reference",
                    autogenerate: { directory: "reference" },
                },
            ],
        }), react()],
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                "@site/static/img": path.resolve(new URL(".", import.meta.url).pathname, "./public/img"),
                "@docusaurus/Head": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/Head.tsx"),
                "@theme/Layout": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/Layout.tsx"),
                "@docusaurus/Link": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/Link.tsx"),
                "@docusaurus/useBaseUrl": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/useBaseUrl.ts"),
                "@docusaurus/theme-common": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/theme-common.ts"),
                "@docusaurus/BrowserOnly": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/BrowserOnly.tsx"),
                "@docusaurus/ExecutionEnvironment": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/ExecutionEnvironment.ts"),
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
