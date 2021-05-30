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
                'collections',
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
                {
                    type: 'category',
                    label: 'Custom views',
                    items: [
                        'custom_views',
                        'contexts/hooks'
                    ]
                }
            ]
        }
    ]
}
