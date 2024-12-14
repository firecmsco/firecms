// eslint-disable-next-line @typescript-eslint/no-var-requires
const typedocSidebar = require("./docs/api/typedoc-sidebar");

module.exports = {
    "docsSidebar": [
        {
            "type": "doc",
            "label": "Introduction",
            "id": "intro"
        },
        "what_is_new_v3",
        {
            "type": "category",
            "label": "FireCMS Cloud  ☁️",
            "collapsed": false,
            link: {
                type: "doc",
                id: "cloud/intro"
            },
            "items": [
                "cloud/quickstart",
                "cloud/app_config",
                "cloud/deployment",
                "cloud/app_check",
                "cloud/creating_service_account",
                "cloud/migrating_from_v2"
            ]
        },
        {
            "type": "category",
            "label": "Self-hosted",
            "collapsed": false,
            "items": [
                "self/firestore_rules",
                {
                    "type": "doc",
                    "label": "Quickstart PRO",
                    "id": "pro/pro_quickstart",
                    className: "pro-sidebar-item"
                },
                {
                    "type": "doc",
                    "label": "Sample PRO",
                    "id": "pro/sample_pro",
                    className: "pro-sidebar-item"
                },
                "self/controllers",
                "self/main_components",
                "self/styling_firecms",
                "self/deployment",
                "pro/app_check",
                "firebase_setup",
                "self/mongodb",
                {
                    "type": "doc",
                    "label": "Licensing",
                    "id": "pro/licensing",
                    className: "pro-sidebar-item"
                },
                {
                    "type": "doc",
                    "label": "User management",
                    "id": "pro/user_management",
                    className: "pro-sidebar-item"
                },
                "self/custom_storage",
                "pro/nextjs",
                "self/migrating_from_v2_to_v3",
                "self/migrating_from_v3_beta"
            ]
        },
        {
            "type": "category",
            "label": "Collections",
            "collapsed": false,
            "items": [
                "collections/collections",
                "collections/callbacks",
                "collections/entity_views",
                "collections/permissions",
                "collections/exporting_data",
                "collections/additional_columns",
                "collections/text_search",
                "collections/dynamic_collections",
                "collections/collection_actions",
                "collections/collection_groups",
                "collections/entity_actions",
                "collections/eject_collections"
            ]
        },
        {
            "type": "category",
            "label": "Properties",
            "collapsed": true,
            "items": [
                "properties/properties_intro",
                {
                    "type": "category",
                    "label": "Fields",
                    "items": [
                        "properties/fields/text_fields",
                        "properties/fields/selects",
                        "properties/fields/file_upload",
                        "properties/fields/switch",
                        "properties/fields/date_time",
                        "properties/fields/references",
                        "properties/fields/group",
                        "properties/fields/key_value",
                        "properties/fields/repeat",
                        "properties/fields/block"
                    ]
                },
                {
                    "type": "category",
                    "label": "Config",
                    "items": [
                        "properties/config/properties_common",
                        "properties/config/string",
                        "properties/config/number",
                        "properties/config/boolean",
                        "properties/config/reference",
                        "properties/config/date",
                        "properties/config/array",
                        "properties/config/map",
                        "properties/config/geopoint"
                    ]
                },
                "properties/conditional_fields",
                "properties/custom_fields",
                "properties/custom_previews",
                "properties/reusing_properties"
            ]
        },
        "top_level_views",
        {
            "type": "category",
            "label": "Provided hooks",
            "items": [
                "hooks/use_auth_controller",
                "hooks/use_side_entity_controller",
                "hooks/use_snackbar_controller",
                "hooks/use_reference_dialog",
                "hooks/use_firecms_context",
                "hooks/use_data_source",
                "hooks/use_storage_source",
                "hooks/use_mode_controller"
            ]
        },
        {
            "type": "category",
            "label": "Recipes",
            "collapsed": false,
            "items": [
                "recipes/building_a_blog",
                "recipes/autoupdate_slug",
                "recipes/data_type_adapter",
                "recipes/copy_entity",
                "recipes/documents_as_subcollections",
                "recipes/entity_callbacks"
            ]
        },
        "icons/icons",
        {
            "type": "category",
            "label": "UI components",
            "collapsed": false,
            link: {
                type: "doc",
                id: "components"
            },
            "items": [
                "components/alert",
                "components/avatar",
                "components/badge",
                "components/boolean_switch",
                "components/button",
                "components/card",
                "components/centered_view",
                "components/checkbox",
                "components/chip",
                "components/circular_progress",
                "components/collapse",
                "components/datetimefield",
                "components/debounced_text_field",
                "components/dialog",
                "components/expandable_panel",
                "components/file_upload",
                "components/icon_button",
                "components/info_label",
                "components/label",
                "components/loading_button",
                "components/markdown",
                "components/menu",
                "components/menubar",
                "components/multi_select",
                "components/paper",
                "components/popover",
                "components/radio_group",
                "components/search_bar",
                "components/select",
                "components/separator",
                "components/sheet",
                "components/skeleton",
                "components/slider",
                "components/table",
                "components/tabs",
                "components/text_field",
                "components/textarea_autosize"
            ]
        },
        "changelog",

    ],
    "typedocSidebar": typedocSidebar
}

