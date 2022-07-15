---
id: "ConfigurationPersistence"
title: "Interface: ConfigurationPersistence"
sidebar_label: "ConfigurationPersistence"
sidebar_position: 0
custom_edit_url: null
---

This interface is in charge of defining the controller that persists
modifications to a collection or schema, and retrieves them back from
a data source, such as local storage or Firestore.

## Methods

### getCollectionConfig

▸ **getCollectionConfig**<`M`\>(`path`): [`PartialEntityCollection`](../types/PartialEntityCollection)<`M`\>

#### Type parameters

| Name |
| :------ |
| `M` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

[`PartialEntityCollection`](../types/PartialEntityCollection)<`M`\>

#### Defined in

[models/config_persistence.tsx:38](https://github.com/Camberi/firecms/blob/2d60fba/src/models/config_persistence.tsx#L38)

___

### onCollectionModified

▸ **onCollectionModified**<`M`\>(`path`, `partialCollection`): `void`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `partialCollection` | [`PartialEntityCollection`](../types/PartialEntityCollection)<`M`\> |

#### Returns

`void`

#### Defined in

[models/config_persistence.tsx:37](https://github.com/Camberi/firecms/blob/2d60fba/src/models/config_persistence.tsx#L37)
