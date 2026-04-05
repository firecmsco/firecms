---
slug: "docs/api/interfaces/EntitySelectionProps"
title: "EntitySelectionProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntitySelectionProps

# Interface: EntitySelectionProps\<M\>

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:29](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\>

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:39](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

Entity collection config

***

### description?

> `optional` **description**: `ReactNode`

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:78](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

Use this description to indicate the user what to do in this dialog.

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<`string`, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:73](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

Allow selection of entities that pass the given filter only.

***

### maxSelection?

> `optional` **maxSelection**: `number`

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:83](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

Maximum number of entities that can be selected.

***

### multiselect?

> `optional` **multiselect**: `boolean`

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:34](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

Allow multiple selection of values

***

### path

> **path**: `string`

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:46](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

Absolute path of the collection.
May be not set if this hook is being used in a component and the path is
dynamic. If not set, the dialog won't open.

***

### selectedEntityIds?

> `optional` **selectedEntityIds**: (`string` \| `number`)[]

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:52](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

If you are opening the dialog for the first time, you can select some
entity ids to be displayed first.

## Methods

### onMultipleEntitiesSelected()?

> `optional` **onMultipleEntitiesSelected**(`entities`): `void`

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:68](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

If `multiselect` is set to `true`, you will get the selected entities
in this callback.

#### Parameters

##### entities

[`Entity`](Entity)\<`any`\>[]

#### Returns

`void`

***

### onSingleEntitySelected()?

> `optional` **onSingleEntitySelected**(`entity`): `void`

Defined in: [core/src/components/ReferenceTable/EntitySelectionTable.tsx:60](https://github.com/rebasepro/rebase/blob/main/packages/core/src/components/ReferenceTable/EntitySelectionTable.tsx)

If `multiselect` is set to `false`, you will get the selected entity
in this callback.

#### Parameters

##### entity

[`Entity`](Entity)\<`any`\> | `null`

#### Returns

`void`
