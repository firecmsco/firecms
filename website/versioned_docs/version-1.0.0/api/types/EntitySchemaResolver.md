---
id: "EntitySchemaResolver"
title: "Type alias: EntitySchemaResolver<M>"
sidebar_label: "EntitySchemaResolver"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntitySchemaResolver**<`M`\>: (`{
                                                 entityId,
                                                 values,
                                                 previousValues
                                             }`: [`EntitySchemaResolverProps`](EntitySchemaResolverProps)<`M`\>) => [`ResolvedEntitySchema`](ResolvedEntitySchema)<`M`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | `any` |

#### Type declaration

▸ (`{
                                                 entityId,
                                                 values,
                                                 previousValues
                                             }`): [`ResolvedEntitySchema`](ResolvedEntitySchema)<`M`\>

Use to resolve the schema properties for specific path, entity id or values.

##### Parameters

| Name | Type |
| :------ | :------ |
| `{
                                                 entityId,
                                                 values,
                                                 previousValues
                                             }` | [`EntitySchemaResolverProps`](EntitySchemaResolverProps)<`M`\> |

##### Returns

[`ResolvedEntitySchema`](ResolvedEntitySchema)<`M`\>

#### Defined in

[models/entities.ts:64](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L64)
