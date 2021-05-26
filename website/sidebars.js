module.exports = {
    mySidebar: [
        {
            type: 'doc',
            label: 'Introduction',
            id: 'intro'
        },
        {
            type: 'doc',
            label: 'Quickstart',
            id: 'quickstart'
        },
        {
            type: 'category',
            label: 'Configuration',
            items: [
                'cms_config',
                'entity_schemas',
                {
                    type: 'category',
                    label: 'Properties',
                    items: [
                        'properties/string',
                        'properties/number',
                        'properties/boolean',
                        'properties/reference',
                        'properties/timestamp',
                        'properties/array',
                        'properties/map',
                        'properties/geopoint'
                    ]
                },
                'custom_fields',
                'collections',
                {
                    type: 'category',
                    label: 'Contexts and hooks',
                    items: [
                        'contexts/auth_context',
                        'contexts/side_entity_controller',
                        'contexts/snackbars',
                    ]
                },
            ]
        }
    ]
}
