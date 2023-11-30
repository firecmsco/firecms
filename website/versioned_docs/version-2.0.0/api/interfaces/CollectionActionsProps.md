---
id: "CollectionActionsProps"
title: "Interface: CollectionActionsProps<M, UserType, EC>"
sidebar_label: "CollectionActionsProps"
sidebar_position: 0
custom_edit_url: null
---

Parameter passed to the `Actions` prop in the collection configuration.
Note that actions are rendered in the collection toolbar, as well
as in the home page card.
If you don't want to render the actions in the home page card, you can
return `null` if mode is `home`.

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |
| `EC` | extends [`EntityCollection`](EntityCollection.md)\<`M`\> = [`EntityCollection`](EntityCollection.md)\<`M`\> |

## Properties

### collection

• **collection**: `EC`

The collection configuration

#### Defined in

[packages/firecms_core/src/types/collections.ts:300](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L300)

___

### collectionEntitiesCount

• **collectionEntitiesCount**: `number`

Count of the entities in this collection

#### Defined in

[packages/firecms_core/src/types/collections.ts:322](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L322)

___

### context

• **context**: [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`\>

Context of the app status

#### Defined in

[packages/firecms_core/src/types/collections.ts:317](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L317)

___

### parentPathSegments

• **parentPathSegments**: `string`[]

Array of the parent path segments like `['users']`

#### Defined in

[packages/firecms_core/src/types/collections.ts:295](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L295)

___

### path

• **path**: `string`

Full collection path of this entity. This is the full path, like
`users/1234/addresses`

#### Defined in

[packages/firecms_core/src/types/collections.ts:285](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L285)

___

### relativePath

• **relativePath**: `string`

Path of the last collection, like `addresses`

#### Defined in

[packages/firecms_core/src/types/collections.ts:290](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L290)

___

### selectionController

• **selectionController**: [`SelectionController`](../types/SelectionController.md)\<`M`\>

Use this controller to get the selected entities and to update the
selected entities state.

#### Defined in

[packages/firecms_core/src/types/collections.ts:306](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L306)

___

### tableController

• **tableController**: [`TableController`](../types/TableController.md)\<`M`\>

Use this controller to get the table controller and to update the
table controller state.

#### Defined in

[packages/firecms_core/src/types/collections.ts:312](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L312)
