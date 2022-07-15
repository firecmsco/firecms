---
id: "ExtraActionsParams"
title: "Interface: ExtraActionsParams<M, UserType>"
sidebar_label: "ExtraActionsParams"
sidebar_position: 0
custom_edit_url: null
---

Parameter passed to the `extraActions` builder in the collection configuration

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` = `any` |
| `UserType` | [`User`](../types/User) |

## Properties

### collection

• **collection**: [`EntityCollection`](EntityCollection)<`M`, `string`, `any`\>

The collection configuration

#### Defined in

[models/collections.ts:232](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L232)

___

### context

• **context**: [`FireCMSContext`](FireCMSContext)<`UserType`\>

Context of the app status

#### Defined in

[models/collections.ts:243](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L243)

___

### path

• **path**: `string`

Collection path of this entity

#### Defined in

[models/collections.ts:227](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L227)

___

### selectionController

• **selectionController**: [`SelectionController`](../types/SelectionController)<`M`\>

Use this controller to get the selected entities and to update the
selected entities state

#### Defined in

[models/collections.ts:238](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L238)
