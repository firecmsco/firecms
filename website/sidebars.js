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
        'cms_config',
        {
            type: 'category',
            label: 'Default views',
            items: [
                'entity_schemas',
                'collections',
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
                'custom_fields'
            ]
        },
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
