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
    site: "https://firecms.co",
    integrations: [
        react({
            experimentalReactChildren: true
        }),
        starlight({
            title: "FireCMS Docs",
            customCss: [
                "./src/styles/global.css",
                "./src/styles/starlight.css"
            ],
            social: [
                {
                    icon: "github",
                    label: "GitHub",
                    href: "https://github.com/firecmsco/firecms"
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
                    slug: "docs/index"
                },
                {
                    label: "☁️ FireCMS Cloud",
                    collapsed: false,
                    items: [
                        {
                            label: "Introduction",
                            slug: "docs/cloud/index"
                        },
                        {
                            label: "Quickstart",
                            slug: "docs/cloud/quickstart"
                        },
                        {
                            label: "App Configuration",
                            slug: "docs/cloud/app_config"
                        },
                        {
                            label: "Deployment",
                            slug: "docs/cloud/deployment"
                        },
                        {
                            label: "App Check",
                            slug: "docs/cloud/app_check"
                        },
                        {
                            label: "Creating Service Account",
                            slug: "docs/cloud/creating_service_account"
                        },
                        {
                            label: "Migrating from v2",
                            slug: "docs/cloud/migrating_from_v2"
                        },
                        {
                            label: "Eject Collections",
                            slug: "docs/cloud/eject_collections"
                        },
                    ],
                },
                {
                    label: "Self-hosted",
                    collapsed: false,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/self"
                        },
                        {
                            label: "Next.js Integration",
                            slug: "docs/pro/nextjs",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Firestore Rules",
                            slug: "docs/pro/firestore_rules",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Sample PRO Project",
                            slug: "docs/pro/sample_pro",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Main Components",
                            slug: "docs/self/main_components"
                        },
                        {
                            label: "Authentication",
                            slug: "docs/self/auth_self_hosted"
                        },
                        {
                            label: "Styling FireCMS",
                            slug: "docs/self/styling_firecms"
                        },
                        {
                            label: "Deployment",
                            slug: "docs/self/deployment"
                        },
                        {
                            label: "App Check",
                            slug: "docs/pro/app_check"
                        },
                        {
                            label: "Firebase Setup",
                            slug: "docs/firebase_setup"
                        },
                        {
                            label: "MongoDB",
                            slug: "docs/self/mongodb"
                        },
                        {
                            label: "Licensing",
                            slug: "docs/pro/licensing",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "User Management",
                            slug: "docs/pro/user_management",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Collection Editor",
                            slug: "docs/pro/collection_editor",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Data Export",
                            slug: "docs/pro/data_export",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Data Import",
                            slug: "docs/pro/data_import",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Entity History",
                            slug: "docs/pro/entity_history",
                            badge: {
                                text: "PRO",
                                variant: "tip"
                            }
                        },
                        {
                            label: "Custom Storage",
                            slug: "docs/self/custom_storage"
                        },
                        {
                            label: "Controllers",
                            slug: "docs/self/controllers"
                        },
                        {
                            label: "Migrating from v3.0 to v3.1",
                            slug: "docs/self/migrating_from_v3_to_v3_1"
                        },
                        {
                            label: "Migrating from v3 Beta",
                            slug: "docs/self/migrating_from_v3_beta"
                        },
                        {
                            label: "Migrating from v2 to v3",
                            slug: "docs/self/migrating_from_v2_to_v3"
                        },
                    ],
                },
                {
                    label: "Collections",
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
                            label: "Exporting Data",
                            slug: "docs/collections/exporting_data"
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
                            label: "Collection Actions",
                            slug: "docs/collections/collection_actions"
                        },
                        {
                            label: "Collection Groups",
                            slug: "docs/collections/collection_groups"
                        },
                        {
                            label: "Entity Actions",
                            slug: "docs/collections/entity_actions"
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
                    label: "Top Level Views",
                    slug: "docs/top_level_views",
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
                            label: "useFireCMSContext",
                            slug: "docs/hooks/use_firecms_context"
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
                    collapsed: false,
                    items: [
                        {
                            label: "Building a Blog",
                            slug: "docs/recipes/building_a_blog"
                        },
                        {
                            label: "Auto-update Slug",
                            slug: "docs/recipes/autoupdate_slug"
                        },
                        {
                            label: "Data Type Adapter",
                            slug: "docs/recipes/data_type_adapter"
                        },
                        {
                            label: "Copy Entity",
                            slug: "docs/recipes/copy_entity"
                        },
                        {
                            label: "Documents as Subcollections",
                            slug: "docs/recipes/documents_as_subcollections"
                        },
                        {
                            label: "Entity Callbacks",
                            slug: "docs/recipes/entity_callbacks"
                        },
                    ],
                },
                {
                    label: "Icons",
                    slug: "docs/icons",
                },
                {
                    label: "UI Components",
                    collapsed: false,
                    items: [
                        {
                            label: "Overview",
                            slug: "docs/components"
                        },
                        {
                            label: "Alert",
                            slug: "docs/components/alert"
                        },
                        {
                            label: "Avatar",
                            slug: "docs/components/avatar"
                        },
                        {
                            label: "Badge",
                            slug: "docs/components/badge"
                        },
                        {
                            label: "Boolean Switch",
                            slug: "docs/components/boolean_switch"
                        },
                        {
                            label: "Button",
                            slug: "docs/components/button"
                        },
                        {
                            label: "Card",
                            slug: "docs/components/card"
                        },
                        {
                            label: "Centered View",
                            slug: "docs/components/centered_view"
                        },
                        {
                            label: "Checkbox",
                            slug: "docs/components/checkbox"
                        },
                        {
                            label: "Chip",
                            slug: "docs/components/chip"
                        },
                        {
                            label: "Circular Progress",
                            slug: "docs/components/circular_progress"
                        },
                        {
                            label: "Collapse",
                            slug: "docs/components/collapse"
                        },
                        {
                            label: "DateTime Field",
                            slug: "docs/components/datetimefield"
                        },
                        {
                            label: "Debounced Text Field",
                            slug: "docs/components/debounced_text_field"
                        },
                        {
                            label: "Dialog",
                            slug: "docs/components/dialog"
                        },
                        {
                            label: "Expandable Panel",
                            slug: "docs/components/expandable_panel"
                        },
                        {
                            label: "File Upload",
                            slug: "docs/components/file_upload"
                        },
                        {
                            label: "Icon Button",
                            slug: "docs/components/icon_button"
                        },
                        {
                            label: "Info Label",
                            slug: "docs/components/info_label"
                        },
                        {
                            label: "Label",
                            slug: "docs/components/label"
                        },
                        {
                            label: "Loading Button",
                            slug: "docs/components/loading_button"
                        },
                        {
                            label: "Markdown",
                            slug: "docs/components/markdown"
                        },
                        {
                            label: "Menu",
                            slug: "docs/components/menu"
                        },
                        {
                            label: "Menubar",
                            slug: "docs/components/menubar"
                        },
                        {
                            label: "Multi Select",
                            slug: "docs/components/multi_select"
                        },
                        {
                            label: "Paper",
                            slug: "docs/components/paper"
                        },
                        {
                            label: "Popover",
                            slug: "docs/components/popover"
                        },
                        {
                            label: "Radio Group",
                            slug: "docs/components/radio_group"
                        },
                        {
                            label: "Search Bar",
                            slug: "docs/components/search_bar"
                        },
                        {
                            label: "Select",
                            slug: "docs/components/select"
                        },
                        {
                            label: "Separator",
                            slug: "docs/components/separator"
                        },
                        {
                            label: "Sheet",
                            slug: "docs/components/sheet"
                        },
                        {
                            label: "Skeleton",
                            slug: "docs/components/skeleton"
                        },
                        {
                            label: "Slider",
                            slug: "docs/components/slider"
                        },
                        {
                            label: "Table",
                            slug: "docs/components/table"
                        },
                        {
                            label: "Tabs",
                            slug: "docs/components/tabs"
                        },
                        {
                            label: "Text Field",
                            slug: "docs/components/text_field"
                        },
                        {
                            label: "Textarea Autosize",
                            slug: "docs/components/textarea_autosize"
                        },
                    ],
                },
                {
                    label: "What's New in v3",
                    slug: "docs/what_is_new_v3"
                },
                {
                    label: "Changelog",
                    slug: "docs/changelog",
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
                "@firecms/ui": path.resolve(new URL(".", import.meta.url).pathname, "../packages/ui/src"),
                "@firecms/editor": path.resolve(new URL(".", import.meta.url).pathname, "../packages/editor/src"),
            }
        },
        server: {
            fs: {
                allow: [path.resolve(new URL(".", import.meta.url).pathname, ".."), path.resolve(new URL(".", import.meta.url).pathname, ".")]
            }
        }
    },
});
