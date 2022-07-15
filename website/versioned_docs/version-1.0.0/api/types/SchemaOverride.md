---
id: "SchemaOverride"
title: "Type alias: SchemaOverride<M, UserType>"
sidebar_label: "SchemaOverride"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SchemaOverride**<`M`, `UserType`\>: `Object`

You can return these parameters to override properties in a [SchemaOverrideHandler](SchemaOverrideHandler).
Useful if you want to apply schemas to specific entities.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | `any` |
| `UserType` | [`User`](User) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbacks?` | [`EntityCallbacks`](../interfaces/EntityCallbacks)<`M`\> | This interface defines all the callbacks that can be used when an entity is being created, updated or deleted. Useful for adding your own logic or blocking the execution of the operation |
| `permissions?` | [`PermissionsBuilder`](PermissionsBuilder)<`M`, `UserType`\> | Can the elements in this collection be added and edited. |
| `schema?` | [`EntitySchema`](../interfaces/EntitySchema)<`M`\> | Schema representing the entities of this view |
| `subcollections?` | [`EntityCollection`](../interfaces/EntityCollection)[] | You can add subcollections to your entity in the same way you define the root collections. |

#### Defined in

[models/schema_override.ts:22](https://github.com/Camberi/firecms/blob/2d60fba/src/models/schema_override.ts#L22)
