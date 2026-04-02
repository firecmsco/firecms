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
                    href: "https://github.com/rebaseco/rebase"
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
                            slug: "docs/self"
                        },
                        {
                            label: "Database Setup",
                            slug: "docs/database_setup"
                        },
                        {
                            label: "Template Walkthrough",
                            slug: "docs/pro/template_walkthrough"
                        },
                        {
                            label: "Authentication",
                            slug: "docs/self/auth_self_hosted"
                        },
                        {
                            label: "Deployment",
                            slug: "docs/self/deployment"
                        },
                    ],
                },
                {
                    label: "Client SDK",
                    collapsed: false,
                    items: [
                        {
                            label: "Client SDK overview",
                            slug: "docs/sdk"
                        }
                    ],
                },
                {
                    label: "Core Concepts",
                    collapsed: false,
                    items: [
                        {
                            label: "Collections",
                            slug: "docs/collections/index"
                        },
                        {
                            label: "View Modes",
                            slug: "docs/collections/view_modes"
                        },
                        {
                            label: "Callbacks",
                            slug: "docs/collections/callbacks"
                        },
                        {
                            label: "Entity Views",
                            slug: "docs/collections/entity_views"
                        },
                        {
                            label: "Permissions",
                            slug: "docs/collections/permissions"
                        },
                        {
                            label: "Additional Columns",
                            slug: "docs/collections/additional_columns"
                        },
                        {
                            label: "Text Search",
                            slug: "docs/collections/text_search"
                        },
                        {
                            label: "Dynamic Collections",
                            slug: "docs/collections/dynamic_collections"
                        },
                        {
                            label: "Entity Actions",
                            slug: "docs/collections/entity_actions"
                        },
                        {
                            label: "Collection Actions",
                            slug: "docs/collections/collection_actions"
                        },
                        {
                            label: "Exporting Data",
                            slug: "docs/collections/exporting_data"
                        },
                    ],
                },
                {
                    label: "Properties",
                    collapsed: true,
                    items: [
                        {
                            label: "Properties Introduction",
                            slug: "docs/properties/index"
                        },
                        {
                            label: "Fields",
                            collapsed: true,
                            items: [
                                {
                                    label: "Text Fields",
                                    slug: "docs/properties/fields/text_fields"
                                },
                                {
                                    label: "Selects",
                                    slug: "docs/properties/fields/selects"
                                },
                                {
                                    label: "File Upload",
                                    slug: "docs/properties/fields/file_upload"
                                },
                                {
                                    label: "Switch",
                                    slug: "docs/properties/fields/switch"
                                },
                                {
                                    label: "Date & Time",
                                    slug: "docs/properties/fields/date_time"
                                },
                                {
                                    label: "References",
                                    slug: "docs/properties/fields/references"
                                },
                                {
                                    label: "Group",
                                    slug: "docs/properties/fields/group"
                                },
                                {
                                    label: "Key Value",
                                    slug: "docs/properties/fields/key_value"
                                },
                                {
                                    label: "Repeat",
                                    slug: "docs/properties/fields/repeat"
                                },
                                {
                                    label: "Block",
                                    slug: "docs/properties/fields/block"
                                },
                            ],
                        },
                        {
                            label: "Config",
                            collapsed: true,
                            items: [
                                {
                                    label: "Properties Common",
                                    slug: "docs/properties/config/properties_common"
                                },
                                {
                                    label: "String",
                                    slug: "docs/properties/config/string"
                                },
                                {
                                    label: "Number",
                                    slug: "docs/properties/config/number"
                                },
                                {
                                    label: "Boolean",
                                    slug: "docs/properties/config/boolean"
                                },
                                {
                                    label: "Reference",
                                    slug: "docs/properties/config/reference"
                                },
                                {
                                    label: "Date",
                                    slug: "docs/properties/config/date"
                                },
                                {
                                    label: "Array",
                                    slug: "docs/properties/config/array"
                                },
                                {
                                    label: "Map",
                                    slug: "docs/properties/config/map"
                                },
                                {
                                    label: "Geopoint",
                                    slug: "docs/properties/config/geopoint"
                                },
                            ],
                        },
                        {
                            label: "Conditional Fields",
                            slug: "docs/properties/conditional_fields"
                        },
                        {
                            label: "Custom Fields",
                            slug: "docs/properties/custom_fields"
                        },
                        {
                            label: "Custom Previews",
                            slug: "docs/properties/custom_previews"
                        },
                        {
                            label: "Reusing Properties",
                            slug: "docs/properties/reusing_properties"
                        },
                    ],
                },
                {
                    label: "Features",
                    collapsed: false,
                    items: [
                        {
                            label: "Collection Editor",
                            slug: "docs/pro/collection_editor"
                        },
                        {
                            label: "Data Import",
                            slug: "docs/pro/data_import"
                        },
                        {
                            label: "Data Export",
                            slug: "docs/pro/data_export"
                        },
                        {
                            label: "Entity History",
                            slug: "docs/pro/entity_history"
                        },
                        {
                            label: "User Management",
                            slug: "docs/pro/user_management"
                        },
                        {
                            label: "SDK Generator",
                            slug: "docs/pro/sdk_generator"
                        },
                    ],
                },
                {
                    label: "Customization",
                    collapsed: true,
                    items: [
                        {
                            label: "Main Components",
                            slug: "docs/self/main_components"
                        },
                        {
                            label: "Styling Rebase",
                            slug: "docs/self/styling_rebase"
                        },
                        {
                            label: "Custom Storage",
                            slug: "docs/self/custom_storage"
                        },
                        {
                            label: "Controllers",
                            slug: "docs/self/controllers"
                        },
                    ],
                },
                {
                    label: "Provided Hooks",
                    collapsed: true,
                    items: [
                        {
                            label: "useAuthController",
                            slug: "docs/hooks/use_auth_controller"
                        },
                        {
                            label: "useSideEntityController",
                            slug: "docs/hooks/use_side_entity_controller"
                        },
                        {
                            label: "useSnackbarController",
                            slug: "docs/hooks/use_snackbar_controller"
                        },
                        {
                            label: "useReferenceDialog",
                            slug: "docs/hooks/use_reference_dialog"
                        },
                        {
                            label: "useRebaseContext",
                            slug: "docs/hooks/use_rebase_context"
                        },
                        {
                            label: "useDataSource",
                            slug: "docs/hooks/use_data_source"
                        },
                        {
                            label: "useStorageSource",
                            slug: "docs/hooks/use_storage_source"
                        },
                        {
                            label: "useModeController",
                            slug: "docs/hooks/use_mode_controller"
                        },
                    ],
                },
                {
                    label: "Recipes",
                    collapsed: true,
                    items: [
                        {
                            label: "Data Type Adapter",
                            slug: "docs/recipes/data_type_adapter"
                        },
                        {
                            label: "Entity Callbacks",
                            slug: "docs/recipes/entity_callbacks"
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
            }
        },
        server: {
            fs: {
                allow: [path.resolve(new URL(".", import.meta.url).pathname, ".."), path.resolve(new URL(".", import.meta.url).pathname, ".")]
            }
        }
    },
});
