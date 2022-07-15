---
id: "CollectionTableProps"
title: "Interface: CollectionTableProps<M, AdditionalKey>"
sidebar_label: "CollectionTableProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |
| `AdditionalKey` | extends `string` = `string` |

## Properties

### collection

• **collection**: [`EntityCollection`](EntityCollection)<`M`, `string`, `any`\> \| [`EntityCollectionResolver`](../types/EntityCollectionResolver)<`M`\>

Collection

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:29](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L29)

___

### entitiesDisplayedFirst

• `Optional` **entitiesDisplayedFirst**: [`Entity`](Entity)<`M`\>[]

List of entities that will be displayed on top, no matter the ordering.
This is used for reference fields selection

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:50](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L50)

___

### hoverRow

• `Optional` **hoverRow**: `boolean`

Should apply a different style to a row when hovering

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:86](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L86)

___

### inlineEditing

• **inlineEditing**: `boolean` \| (`entity`: [`Entity`](Entity)<`any`\>) => `boolean`

Can the table be edited inline

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:44](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L44)

___

### path

• **path**: `string`

Absolute collection path

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:24](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L24)

___

### schemaResolver

• **schemaResolver**: [`EntitySchemaResolver`](../types/EntitySchemaResolver)<`M`\>

Use to resolve the schema properties for specific path, entity id or values

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:34](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L34)

___

### title

• `Optional` **title**: `ReactNode`

Override the title in the toolbar

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:39](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L39)

## Methods

### onColumnResize

▸ `Optional` **onColumnResize**(`params`): `void`

Callback when a column is resized

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`OnColumnResizeParams`](../types/OnColumnResizeParams) |

#### Returns

`void`

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:76](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L76)

___

### onEntityClick

▸ `Optional` **onEntityClick**(`entity`): `void`

Callback when anywhere on the table is clicked

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](Entity)<`M`\> |

#### Returns

`void`

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:71](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L71)

___

### onSizeChanged

▸ `Optional` **onSizeChanged**(`size`): `void`

Callback when the selected size of the table is changed

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | [`CollectionSize`](../types/CollectionSize) |

#### Returns

`void`

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:81](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L81)

___

### tableRowActionsBuilder

▸ `Optional` **tableRowActionsBuilder**(`__namedParameters`): `ReactNode`

Builder for creating the buttons in each row

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.entity` | [`Entity`](Entity)<`M`\> |
| `__namedParameters.size` | [`CollectionSize`](../types/CollectionSize) |

#### Returns

`ReactNode`

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:63](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L63)

___

### toolbarActionsBuilder

▸ `Optional` **toolbarActionsBuilder**(`props`): `ReactNode`

Additional components builder such as buttons in the
collection toolbar

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.data` | [`Entity`](Entity)<`any`\>[] |
| `props.size` | [`CollectionSize`](../types/CollectionSize) |

#### Returns

`ReactNode`

#### Defined in

[core/components/CollectionTable/CollectionTableProps.tsx:56](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/CollectionTable/CollectionTableProps.tsx#L56)
