---
slug: "docs/api/functions/EntityCollectionRowActions"
title: "EntityCollectionRowActions"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCollectionRowActions

# Function: EntityCollectionRowActions()

> **EntityCollectionRowActions**(`entity`): `Element`

Defined in: [core/src/components/EntityCollectionTable/EntityCollectionRowActions.tsx:22](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/EntityCollectionTable/EntityCollectionRowActions.tsx)

## Parameters

### entity

#### actions?

[`EntityAction`](../type-aliases/EntityAction)[] = `[]`

#### collection?

[`EntityCollection`](../interfaces/EntityCollection)\<`any`, `any`\>

#### entity

[`Entity`](../interfaces/Entity)\<`any`\>

#### frozen?

`boolean`

#### hideId?

`boolean`

#### highlightEntity?

(`entity`) => `void`

#### isDraggable?

`boolean`

#### isDragging?

`boolean`

#### isSelected?

`boolean`

#### onCollectionChange?

() => `void`

#### openEntityMode

`"side_panel"` \| `"full_screen"`

#### path?

`string`

#### selectionController?

[`SelectionController`](../type-aliases/SelectionController)

#### selectionEnabled?

`boolean`

#### size

[`CollectionSize`](../type-aliases/CollectionSize)

#### sortableAttributes?

`Record`\<`string`, `any`\>

#### sortableNodeRef?

(`node`) => `void`

#### sortableStyle?

`CSSProperties`

#### unhighlightEntity?

(`entity`) => `void`

#### width

`number`

## Returns

`Element`
