---
id: "UserConfigurationPersistence"
title: "Interface: UserConfigurationPersistence"
sidebar_label: "UserConfigurationPersistence"
sidebar_position: 0
custom_edit_url: null
---

This interface is in charge of defining the controller that persists
modifications to a collection or collection, and retrieves them back from
a data source, such as local storage or Firestore.

## Properties

### collapsedGroups

• **collapsedGroups**: `string`[]

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:21](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L21)

___

### favouritePaths

• **favouritePaths**: `string`[]

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:19](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L19)

___

### getCollectionConfig

• **getCollectionConfig**: \<M\>(`path`: `string`) => `Partial`\<[`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>\>

#### Type declaration

▸ \<`M`\>(`path`): `Partial`\<[`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

##### Returns

`Partial`\<[`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>\>

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:16](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L16)

___

### onCollectionModified

• **onCollectionModified**: \<M\>(`path`: `string`, `partialCollection`: `Partial`\<[`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>\>) => `void`

#### Type declaration

▸ \<`M`\>(`path`, `partialCollection`): `void`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `partialCollection` | `Partial`\<[`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>\> |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:15](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L15)

___

### recentlyVisitedPaths

• **recentlyVisitedPaths**: `string`[]

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:17](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L17)

___

### setCollapsedGroups

• **setCollapsedGroups**: (`paths`: `string`[]) => `void`

#### Type declaration

▸ (`paths`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `paths` | `string`[] |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:22](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L22)

___

### setFavouritePaths

• **setFavouritePaths**: (`paths`: `string`[]) => `void`

#### Type declaration

▸ (`paths`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `paths` | `string`[] |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:20](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L20)

___

### setRecentlyVisitedPaths

• **setRecentlyVisitedPaths**: (`paths`: `string`[]) => `void`

#### Type declaration

▸ (`paths`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `paths` | `string`[] |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/types/local_config_persistence.tsx:18](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/local_config_persistence.tsx#L18)
