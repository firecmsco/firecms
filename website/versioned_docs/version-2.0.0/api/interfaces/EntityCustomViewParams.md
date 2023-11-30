---
id: "EntityCustomViewParams"
title: "Interface: EntityCustomViewParams<M>"
sidebar_label: "EntityCustomViewParams"
sidebar_position: 0
custom_edit_url: null
---

Parameters passed to the builder in charge of rendering a custom panel for
an entity view.

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

## Properties

### collection

• **collection**: [`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>

collection used by this entity

#### Defined in

[packages/firecms_core/src/types/collections.ts:445](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L445)

___

### entity

• `Optional` **entity**: [`Entity`](Entity.md)\<`M`\>

Entity that this view refers to. It can be undefined if the entity is new

#### Defined in

[packages/firecms_core/src/types/collections.ts:450](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L450)

___

### formContext

• **formContext**: [`FormContext`](FormContext.md)\<`any`\>

Use the form context to access the form state and methods

#### Defined in

[packages/firecms_core/src/types/collections.ts:462](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L462)

___

### modifiedValues

• `Optional` **modifiedValues**: `M`

Modified values in the form that have not been saved yet.
If the entity is not new and the values are not modified, these values
are the same as in `entity`

#### Defined in

[packages/firecms_core/src/types/collections.ts:457](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L457)
