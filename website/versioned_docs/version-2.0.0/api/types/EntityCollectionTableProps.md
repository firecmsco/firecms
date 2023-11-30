---
id: "EntityCollectionTableProps"
title: "Type alias: EntityCollectionTableProps<M, AdditionalKey, UserType>"
sidebar_label: "EntityCollectionTableProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityCollectionTableProps**\<`M`, `AdditionalKey`, `UserType`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `AddColumnComponent?` | `React.ComponentType` | - |
| `AdditionalHeaderWidget?` | (`props`: \{ `onHover`: `boolean` ; `property`: [`ResolvedProperty`](ResolvedProperty.md) ; `propertyKey`: `string`  }) => `React.ReactNode` | - |
| `actions?` | `React.ReactNode` | Additional component that renders actions such as buttons in the collection toolbar, displayed on the right side |
| `actionsStart?` | `React.ReactNode` | Additional component that renders actions such as buttons in the collection toolbar, displayed on the left side |
| `additionalFields?` | [`AdditionalFieldDelegate`](../interfaces/AdditionalFieldDelegate.md)\<`M`, `AdditionalKey`, `UserType`\>[] | - |
| `additionalIDHeaderWidget?` | `React.ReactNode` | - |
| `defaultSize?` | [`CollectionSize`](CollectionSize.md) | - |
| `displayedColumnIds` | `PropertyColumnConfig`[] | - |
| `emptyComponent?` | `React.ReactNode` | - |
| `endAdornment?` | `React.ReactNode` | - |
| `filterable?` | `boolean` | - |
| `forceFilter?` | [`FilterValues`](FilterValues.md)\<`Extract`\<keyof `M`, `string`\>\> | - |
| `getIdColumnWidth?` | () => `number` | - |
| `getPropertyFor?` | (`props`: `GetPropertyForProps`\<`M`\>) => [`ResolvedProperties`](ResolvedProperties.md)\<`M`\>[`string`] | - |
| `highlightedEntities?` | [`Entity`](../interfaces/Entity.md)\<`M`\>[] | List of entities that will be displayed as selected; |
| `hoverRow?` | `boolean` | Should apply a different style to a row when hovering |
| `inlineEditing?` | `boolean` \| (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `boolean` | - |
| `onValueChange?` | [`OnCellValueChange`](OnCellValueChange.md)\<`any`, `M`\> | Callback when a cell value changes. |
| `properties` | [`ResolvedProperties`](ResolvedProperties.md)\<`M`\> | - |
| `selectionController` | [`SelectionController`](SelectionController.md)\<`M`\> | Display these entities as selected |
| `sortable?` | `boolean` | - |
| `tableController` | [`TableController`](TableController.md)\<`M`\> | Controller holding the logic for the table [useEntityCollectionTableController](../functions/useEntityCollectionTableController.md) [TableController](TableController.md) |
| `tableRowActionsBuilder?` | (`params`: \{ `entity`: [`Entity`](../interfaces/Entity.md)\<`M`\> ; `frozen?`: `boolean` ; `size`: [`CollectionSize`](CollectionSize.md) ; `width`: `number`  }) => `React.ReactNode` | Builder for creating the buttons in each row |
| `textSearchEnabled?` | `boolean` | - |
| `title?` | `React.ReactNode` | Override the title in the toolbar |
| `uniqueFieldValidator?` | [`UniqueFieldValidator`](UniqueFieldValidator.md) | - |
| `onColumnResize?` | (`params`: [`OnColumnResizeParams`](OnColumnResizeParams.md)) => `void` | Callback when a column is resized |
| `onEntityClick?` | (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `void` | Callback when anywhere on the table is clicked |
| `onSizeChanged?` | (`size`: [`CollectionSize`](CollectionSize.md)) => `void` | Callback when the selected size of the table is changed |

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/EntityCollectionTableProps.tsx:23](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/EntityCollectionTableProps.tsx#L23)
