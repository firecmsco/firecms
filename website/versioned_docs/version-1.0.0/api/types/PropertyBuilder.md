---
id: "PropertyBuilder"
title: "Type alias: PropertyBuilder<T, M>"
sidebar_label: "PropertyBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyBuilder**<`T`, `M`\>: (`{
                                                                         values,
                                                                         previousValues,
                                                                         path,
                                                                         entityId
                                                                     }`: [`PropertyBuilderProps`](PropertyBuilderProps)<`M`\>) => [`Property`](Property)<`T`\> \| ``null``

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](CMSType) = [`CMSType`](CMSType) |
| `M` | `any` |

#### Type declaration

▸ (`{
                                                                         values,
                                                                         previousValues,
                                                                         path,
                                                                         entityId
                                                                     }`): [`Property`](Property)<`T`\> \| ``null``

##### Parameters

| Name | Type |
| :------ | :------ |
| `{
                                                                         values,
                                                                         previousValues,
                                                                         path,
                                                                         entityId
                                                                     }` | [`PropertyBuilderProps`](PropertyBuilderProps)<`M`\> |

##### Returns

[`Property`](Property)<`T`\> \| ``null``

#### Defined in

[models/properties.ts:196](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L196)
