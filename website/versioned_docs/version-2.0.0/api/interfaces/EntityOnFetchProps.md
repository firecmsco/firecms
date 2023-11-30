---
id: "EntityOnFetchProps"
title: "Interface: EntityOnFetchProps<M, UserType>"
sidebar_label: "EntityOnFetchProps"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to hooks when an entity is fetched

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

## Properties

### collection

• **collection**: [`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>

Collection of the entity

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:80](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L80)

___

### context

• **context**: [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`\>

Context of the app status

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:96](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L96)

___

### entity

• **entity**: [`Entity`](Entity.md)\<`M`\>

Fetched entity

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:91](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L91)

___

### path

• **path**: `string`

Full path of the CMS where this collection is being fetched.
Might contain unresolved aliases.

#### Defined in

[packages/firecms_core/src/types/entity_callbacks.ts:86](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_callbacks.ts#L86)
