// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import path from "node:path";
import starlight from "@astrojs/starlight";
import mdx from '@astrojs/mdx';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
    site: "https://rebase.pro",
    integrations: [
        react({
            experimentalReactChildren: true
        }),
        starlight({
            title: "Rebase Docs",
            customCss: [
                "./src/styles/global.css",
                "./src/styles/starlight.css"
            ],
            social: [
                {
                    icon: "github",
                    label: "GitHub",
                    href: "https://github.com/rebasepro/rebase"
                }
            ],
            expressiveCode: {
                themes: ["github-dark"],
                styleOverrides: {
                    borderRadius: "0.5rem",
                    codeFontFamily: "var(--font-mono)",
                    codeFontSize: "0.875rem",
                    codeBackground: "var(--color-surface-900)",
                },
                frames: {
                    showCopyToClipboardButton: true,
                },
                defaultProps: {
                    frame: "none",
                },
            },
            sidebar: [
                {
                    label: "Getting Started",
                    collapsed: false,
                    items: [
                        {
                            label: "Introduction",
                            slug: "docs/index"
                        },
                        {
                            label: "Quickstart",
                            slug: "docs/getting-started/quickstart"
                        },
                        {
                            label: "Project Structure",
                            slug: "docs/getting-started/project-structure"
                        },
                        {
                            label: "Configuration",
                            slug: "docs/getting-started/configuration"
                        },
                        {
                            label: "Deployment",
                            slug: "docs/getting-started/deployment"
                        },
                    ],
                },
                {
                    label: "Architecture",
                    collapsed: false,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/architecture"
                        },
                        {
                            label: "Schema as Code",
                            slug: "docs/architecture/schema-as-code"
                        },
                    ],
                },
                {
                    label: "Collections",
                    collapsed: false,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/collections"
                        },
                        {
                            label: "Properties",
                            slug: "docs/collections/properties"
                        },
                        {
                            label: "Relations",
                            slug: "docs/collections/relations"
                        },
                        {
                            label: "Security Rules (RLS)",
                            slug: "docs/collections/security-rules"
                        },
                        {
                            label: "Entity Callbacks",
                            slug: "docs/collections/callbacks"
                        },
                    ],
                },
                {
                    label: "Backend",
                    collapsed: false,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/backend"
                        },
                        {
                            label: "Entity History",
                            slug: "docs/backend/history"
                        },
                    ],
                },
                {
                    label: "Authentication",
                    collapsed: false,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/auth"
                        },
                    ],
                },
                {
                    label: "Storage",
                    collapsed: true,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/storage"
                        },
                    ],
                },
                {
                    label: "Client SDK",
                    collapsed: true,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/sdk"
                        },
                    ],
                },
                {
                    label: "Frontend (React)",
                    collapsed: true,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/frontend"
                        },
                        {
                            label: "View Modes",
                            slug: "docs/frontend/view-modes"
                        },
                        {
                            label: "Custom Fields",
                            slug: "docs/frontend/custom-fields"
                        },
                        {
                            label: "Entity Views",
                            slug: "docs/frontend/entity-views"
                        },
                        {
                            label: "Entity Actions",
                            slug: "docs/frontend/entity-actions"
                        },
                        {
                            label: "Additional Columns",
                            slug: "docs/frontend/additional-columns"
                        },
                    ],
                },
                {
                    label: "Hooks Reference",
                    collapsed: true,
                    items: [
                        {
                            label: "All Hooks",
                            slug: "docs/hooks"
                        },
                    ],
                },
                {
                    label: "Plugins",
                    collapsed: true,
                    items: [
                        {
                            label: "Plugin System",
                            slug: "docs/plugins"
                        },
                    ],
                },
                {
                    label: "Studio Tools",
                    collapsed: true,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/studio"
                        },
                    ],
                },
                {
                    label: "CLI",
                    collapsed: true,
                    items: [
                        {
                            label: "Commands",
                            slug: "docs/cli"
                        },
                    ],
                },
                {
                    label: "Features",
                    collapsed: true,
                    items: [
                        {
                            label: "Data Import",
                            slug: "docs/features/data-import"
                        },
                        {
                            label: "Data Export",
                            slug: "docs/features/data-export"
                        },
                    ],
                },
                {
                    label: "Recipes",
                    collapsed: true,
                    items: [
                        {
                            label: "Blog CMS",
                            slug: "docs/recipes/blog-cms"
                        },
                        {
                            label: "Custom Dashboard",
                            slug: "docs/recipes/custom-dashboard"
                        },
                        {
                            label: "Webhook Integration",
                            slug: "docs/recipes/webhooks"
                        },
                    ],
                },
            ],
            components: {
                PageFrame: "./src/components/starlight/PageFrame.astro",
                Header: "./src/components/starlight/Header.astro",
                SiteTitle: "./src/components/starlight/SiteTitle.astro",
                Head: "./src/components/starlight/Head.astro",
            },
        }),
        mdx(),
        sitemap()
    ],
    vite: {
        plugins: [
            tailwindcss(),
            yaml()
        ],
        resolve: {
            alias: {
                "@rebasepro/ui": path.resolve(new URL(".", import.meta.url).pathname, "../packages/ui/src"),
                "@rebasepro/editor": path.resolve(new URL(".", import.meta.url).pathname, "../packages/editor/src"),
                "@rebasepro/cms": path.resolve(new URL(".", import.meta.url).pathname, "../packages/cms/src"),
            }
        },
        server: {
            fs: {
                allow: [path.resolve(new URL(".", import.meta.url).pathname, ".."), path.resolve(new URL(".", import.meta.url).pathname, ".")]
            }
        }
    },
});
