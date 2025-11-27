---
slug: "docs/api/functions/EntityCollectionRowActions"
title: "EntityCollectionRowActions"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCollectionRowActions

# Function: EntityCollectionRowActions()

> **EntityCollectionRowActions**(`entity`): `Element`

Defined in: [components/EntityCollectionTable/EntityCollectionRowActions.tsx:33](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/EntityCollectionTable/EntityCollectionRowActions.tsx)

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

#### fullIdPath?

`string`

#### fullPath?

`string`

#### hideId?

`boolean`

#### highlightEntity?

(`entity`) => `void`

#### isSelected?

`boolean`

#### onCollectionChange?

() => `void`

#### openEntityMode

`"side_panel"` \| `"full_screen"`

#### selectionController?

[`SelectionController`](../type-aliases/SelectionController)

#### selectionEnabled?

`boolean`

#### size

[`CollectionSize`](../type-aliases/CollectionSize)

#### unhighlightEntity?

(`entity`) => `void`

#### width

`number`

## Returns

`Element`
