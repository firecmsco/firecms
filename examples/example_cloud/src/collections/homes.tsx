import { buildCollection, buildProperty } from '@firecms/cloud';

export const homesCollection = buildCollection<any>({
  name: 'Homes',
  path: 'homes',
  id: 'homes',
  properties: {
    id: buildProperty({
      name: 'ID',
      dataType: 'string',
      disabled: true,
    }),
    nickname: buildProperty({
      dataType: 'string',
      name: 'Name',
    }),
    address: buildProperty<any>({
      dataType: 'map',
      name: 'Address',
      properties: {
        streetNumber: {
          dataType: 'string',
          name: 'Street Number',
        },
        streetShort: {
          dataType: 'string',
          name: 'Street Short',
        },
        streetLong: {
          dataType: 'string',
          name: 'Street Long',
        },
        city: {
          dataType: 'string',
          name: 'City',
        },
        state: {
          dataType: 'string',
          name: 'State',
        },
        postalCode: {
          dataType: 'string',
          name: 'Zip',
        },
        latitude: {
          dataType: 'number',
          name: 'Latitude',
        },
        longitute: {
          dataType: 'number',
          name: 'Longitude',
        },
        unit: {
          dataType: 'string',
          name: 'Unit',
        },
        googlePlaceId: {
          dataType: 'string',
          name: 'Google Place ID',
        },
      },
    }),
    homeSetupState: buildProperty({
      dataType: 'string',
      name: 'Home Setup State',
    }),
    documents: buildProperty({
      dataType: 'array',
      name: 'Documents',
      of: {
        dataType: 'map',
        name: 'Document',
        properties: {
          id: {
            dataType: 'string',
            name: 'ID',
          },
          name: {
            dataType: 'string',
            name: 'Name',
          },
          url: {
            dataType: 'string',
            name: 'URL',
          },
          type: {
            dataType: 'string',
            name: 'Type',
          },
        },
      },
    }),
    features: buildProperty({
      name: 'Features',
      dataType: 'array',
      of: {
        name: 'Feature',
        dataType: 'map',
        propertyConfig: 'feature',
      },
    }),
    onboardingTags: buildProperty({
      dataType: 'array',
      name: 'Onboarding Tags',
      of: {
        dataType: 'string',
        name: 'Onboarding Tag',
      },
    }),
    createdAt: buildProperty({
      dataType: 'string',
      name: 'Created At',
    }),
    updatedAt: buildProperty({
      dataType: 'string',
      name: 'Updated At',
    }),
    userId: buildProperty({
      dataType: 'string',
      name: 'User ID',
    }),
    modelHomeId: buildProperty({
      dataType: 'string',
      name: 'Model Home ID',
    }),
    agentId: buildProperty({
      dataType: 'string',
      name: 'Agent ID',
    }),
    inviteId: buildProperty({
      dataType: 'string',
      name: 'Invite ID',
    }),
  },
});
