import { PropertyConfig, buildProperty } from '@firecms/cloud';

export const featureConfig: PropertyConfig = {
  name: 'Feature',
  key: 'feature',
  property: {
    dataType: 'map',
    name: 'Feature',
    properties: {
      id: {
        dataType: 'string',
        name: 'ID',
      },
      name: {
        dataType: 'string',
        name: 'Name',
      },
      tag: {
        dataType: 'string',
        name: 'Tag',
      },
      careTag: {
        dataType: 'string',
        name: 'Care Tag',
      },
      hasRooms: {
        dataType: 'boolean',
        name: 'Has Rooms',
      },
      parentFeatureId: {
        dataType: 'string',
        name: 'Parent Feature ID',
      },
      isRoom: {
        dataType: 'boolean',
        name: 'Is Room',
      },
      createdAt: {
        dataType: 'date',
        name: 'Created At',
      },
      attributes: buildProperty({
        dataType: 'array',
        name: 'Attributes',
        of: {
          dataType: 'map',
          name: 'Attribute',
          previewProperties: ['name'],
          properties: {
            id: {
              dataType: 'string',
              name: 'ID',
            },
            name: {
              dataType: 'string',
              name: 'Name',
            },
            value: {
              dataType: 'string',
              name: 'Value',
            },
          },
        },
      }),
    },
  },
};
