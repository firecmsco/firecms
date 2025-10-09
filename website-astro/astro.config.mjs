// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://astro.build/config
export default defineConfig({
    site: "https://firecms.co",
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
                "@theme/Layout": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/Layout.tsx"),
                "@firecms/ui": path.resolve(new URL(".", import.meta.url).pathname, "../packages/ui"),
                "@theme/CodeBlock": path.resolve(new URL(".", import.meta.url).pathname, "./src/migration/stubs/CodeBlock.tsx")
            }
        },
        server: {
            fs: {
                allow: [path.resolve(new URL(".", import.meta.url).pathname, ".."), path.resolve(new URL(".", import.meta.url).pathname, ".")]
            }
        }
    },
});
