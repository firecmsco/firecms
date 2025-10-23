// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import path from "node:path";
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
    site: "https://firecms.co",
    integrations: [
        react({
            experimentalReactChildren: true
        }),
        starlight({
            title: 'FireCMS Docs',
            customCss: [
                './src/styles/global.css',
            ],
            social: [
                { icon: 'github', label: 'GitHub', href: 'https://github.com/firecmsco/firecms' }
            ],
            sidebar: [
                {
                    label: 'Getting Started',
                    items: [
                        { label: 'Introduction', slug: 'docs/index' },
                        { label: "What's New in v3", slug: 'docs/what_is_new_v3' },
                    ],
                },
                {
                    label: '☁️ FireCMS Cloud',
                    collapsed: false,
                    items: [
                        { label: 'Introduction', slug: 'docs/cloud/index' },
                        // { label: 'Quickstart', slug: 'docs/cloud/quickstart' },
                        // { label: 'App Configuration', slug: 'docs/cloud/app_config' },
                        // { label: 'Deployment', slug: 'docs/cloud/deployment' },
                        // { label: 'App Check', slug: 'docs/cloud/app_check' },
                        // { label: 'Creating Service Account', slug: 'docs/cloud/creating_service_account' },
                        // { label: 'Migrating from v2', slug: 'docs/cloud/migrating_from_v2' },
                        // { label: 'Eject Collections', slug: 'docs/cloud/eject_collections' },
                    ],
                },
                // {
                //     label: 'Self-hosted',
                //     collapsed: false,
                //     items: [
                //         { label: 'Overview', slug: 'self' },
                //         { label: 'Next.js Integration', slug: 'pro/nextjs', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Firestore Rules', slug: 'pro/firestore_rules', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Sample PRO Project', slug: 'pro/sample_pro', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Main Components', slug: 'self/main_components' },
                //         { label: 'Authentication', slug: 'self/auth_self_hosted' },
                //         { label: 'Styling FireCMS', slug: 'self/styling_firecms' },
                //         { label: 'Deployment', slug: 'self/deployment' },
                //         { label: 'App Check', slug: 'pro/app_check' },
                //         { label: 'Firebase Setup', slug: 'firebase_setup' },
                //         { label: 'MongoDB', slug: 'self/mongodb' },
                //         { label: 'Licensing', slug: 'pro/licensing', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'User Management', slug: 'pro/user_management', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Collection Editor', slug: 'pro/collection_editor', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Data Export', slug: 'pro/data_export', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Data Import', slug: 'pro/data_import', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Entity History', slug: 'pro/entity_history', badge: { text: 'PRO', variant: 'tip' } },
                //         { label: 'Custom Storage', slug: 'self/custom_storage' },
                //         { label: 'Controllers', slug: 'self/controllers' },
                //         { label: 'Migrating from v2 to v3', slug: 'self/migrating_from_v2_to_v3' },
                //         { label: 'Migrating from v3 Beta', slug: 'self/migrating_from_v3_beta' },
                //     ],
                // },
                // {
                //     label: 'Collections',
                //     collapsed: false,
                //     items: [
                //         { label: 'Collections', slug: 'collections/collections' },
                //         { label: 'Callbacks', slug: 'collections/callbacks' },
                //         { label: 'Entity Views', slug: 'collections/entity_views' },
                //         { label: 'Permissions', slug: 'collections/permissions' },
                //         { label: 'Exporting Data', slug: 'collections/exporting_data' },
                //         { label: 'Additional Columns', slug: 'collections/additional_columns' },
                //         { label: 'Text Search', slug: 'collections/text_search' },
                //         { label: 'Dynamic Collections', slug: 'collections/dynamic_collections' },
                //         { label: 'Collection Actions', slug: 'collections/collection_actions' },
                //         { label: 'Collection Groups', slug: 'collections/collection_groups' },
                //         { label: 'Entity Actions', slug: 'collections/entity_actions' },
                //     ],
                // },
                // {
                //     label: 'Properties',
                //     collapsed: true,
                //     items: [
                //         { label: 'Properties Introduction', slug: 'properties/properties_intro' },
                //         {
                //             label: 'Fields',
                //             collapsed: true,
                //             items: [
                //                 { label: 'Text Fields', slug: 'properties/fields/text_fields' },
                //                 { label: 'Selects', slug: 'properties/fields/selects' },
                //                 { label: 'File Upload', slug: 'properties/fields/file_upload' },
                //                 { label: 'Switch', slug: 'properties/fields/switch' },
                //                 { label: 'Date & Time', slug: 'properties/fields/date_time' },
                //                 { label: 'References', slug: 'properties/fields/references' },
                //                 { label: 'Group', slug: 'properties/fields/group' },
                //                 { label: 'Key Value', slug: 'properties/fields/key_value' },
                //                 { label: 'Repeat', slug: 'properties/fields/repeat' },
                //                 { label: 'Block', slug: 'properties/fields/block' },
                //             ],
                //         },
                //         {
                //             label: 'Config',
                //             collapsed: true,
                //             items: [
                //                 { label: 'Properties Common', slug: 'properties/config/properties_common' },
                //                 { label: 'String', slug: 'properties/config/string' },
                //                 { label: 'Number', slug: 'properties/config/number' },
                //                 { label: 'Boolean', slug: 'properties/config/boolean' },
                //                 { label: 'Reference', slug: 'properties/config/reference' },
                //                 { label: 'Date', slug: 'properties/config/date' },
                //                 { label: 'Array', slug: 'properties/config/array' },
                //                 { label: 'Map', slug: 'properties/config/map' },
                //                 { label: 'Geopoint', slug: 'properties/config/geopoint' },
                //             ],
                //         },
                //         { label: 'Conditional Fields', slug: 'properties/conditional_fields' },
                //         { label: 'Custom Fields', slug: 'properties/custom_fields' },
                //         { label: 'Custom Previews', slug: 'properties/custom_previews' },
                //         { label: 'Reusing Properties', slug: 'properties/reusing_properties' },
                //     ],
                // },
                // {
                //     label: 'Top Level Views',
                //     slug: 'top_level_views',
                // },
                // {
                //     label: 'Provided Hooks',
                //     collapsed: true,
                //     items: [
                //         { label: 'useAuthController', slug: 'hooks/use_auth_controller' },
                //         { label: 'useSideEntityController', slug: 'hooks/use_side_entity_controller' },
                //         { label: 'useSnackbarController', slug: 'hooks/use_snackbar_controller' },
                //         { label: 'useReferenceDialog', slug: 'hooks/use_reference_dialog' },
                //         { label: 'useFireCMSContext', slug: 'hooks/use_firecms_context' },
                //         { label: 'useDataSource', slug: 'hooks/use_data_source' },
                //         { label: 'useStorageSource', slug: 'hooks/use_storage_source' },
                //         { label: 'useModeController', slug: 'hooks/use_mode_controller' },
                //     ],
                // },
                // {
                //     label: 'Recipes',
                //     collapsed: false,
                //     items: [
                //         { label: 'Building a Blog', slug: 'recipes/building_a_blog' },
                //         { label: 'Auto-update Slug', slug: 'recipes/autoupdate_slug' },
                //         { label: 'Data Type Adapter', slug: 'recipes/data_type_adapter' },
                //         { label: 'Copy Entity', slug: 'recipes/copy_entity' },
                //         { label: 'Documents as Subcollections', slug: 'recipes/documents_as_subcollections' },
                //         { label: 'Entity Callbacks', slug: 'recipes/entity_callbacks' },
                //     ],
                // },
                // {
                //     label: 'Icons',
                //     slug: 'icons/icons',
                // },
                // {
                //     label: 'UI Components',
                //     collapsed: false,
                //     items: [
                //         { label: 'Overview', slug: 'components' },
                //         { label: 'Alert', slug: 'components/alert' },
                //         { label: 'Avatar', slug: 'components/avatar' },
                //         { label: 'Badge', slug: 'components/badge' },
                //         { label: 'Boolean Switch', slug: 'components/boolean_switch' },
                //         { label: 'Button', slug: 'components/button' },
                //         { label: 'Card', slug: 'components/card' },
                //         { label: 'Centered View', slug: 'components/centered_view' },
                //         { label: 'Checkbox', slug: 'components/checkbox' },
                //         { label: 'Chip', slug: 'components/chip' },
                //         { label: 'Circular Progress', slug: 'components/circular_progress' },
                //         { label: 'Collapse', slug: 'components/collapse' },
                //         { label: 'DateTime Field', slug: 'components/datetimefield' },
                //         { label: 'Debounced Text Field', slug: 'components/debounced_text_field' },
                //         { label: 'Dialog', slug: 'components/dialog' },
                //         { label: 'Expandable Panel', slug: 'components/expandable_panel' },
                //         { label: 'File Upload', slug: 'components/file_upload' },
                //         { label: 'Icon Button', slug: 'components/icon_button' },
                //         { label: 'Info Label', slug: 'components/info_label' },
                //         { label: 'Label', slug: 'components/label' },
                //         { label: 'Loading Button', slug: 'components/loading_button' },
                //         { label: 'Markdown', slug: 'components/markdown' },
                //         { label: 'Menu', slug: 'components/menu' },
                //         { label: 'Menubar', slug: 'components/menubar' },
                //         { label: 'Multi Select', slug: 'components/multi_select' },
                //         { label: 'Paper', slug: 'components/paper' },
                //         { label: 'Popover', slug: 'components/popover' },
                //         { label: 'Radio Group', slug: 'components/radio_group' },
                //         { label: 'Search Bar', slug: 'components/search_bar' },
                //         { label: 'Select', slug: 'components/select' },
                //         { label: 'Separator', slug: 'components/separator' },
                //         { label: 'Sheet', slug: 'components/sheet' },
                //         { label: 'Skeleton', slug: 'components/skeleton' },
                //         { label: 'Slider', slug: 'components/slider' },
                //         { label: 'Table', slug: 'components/table' },
                //         { label: 'Tabs', slug: 'components/tabs' },
                //         { label: 'Text Field', slug: 'components/text_field' },
                //         { label: 'Textarea Autosize', slug: 'components/textarea_autosize' },
                //     ],
                // },
                // {
                //     label: 'Changelog',
                //     slug: 'changelog',
                // },
            ],
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
