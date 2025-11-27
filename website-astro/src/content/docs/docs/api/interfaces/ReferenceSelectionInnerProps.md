---
slug: "docs/api/interfaces/ReferenceSelectionInnerProps"
title: "ReferenceSelectionInnerProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / ReferenceSelectionInnerProps

# Interface: ReferenceSelectionInnerProps\<M\>

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\>

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:38](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

Entity collection config

***

### description?

> `optional` **description**: `ReactNode`

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

Use this description to indicate the user what to do in this dialog.

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<`string`, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:72](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

Allow selection of entities that pass the given filter only.

***

### maxSelection?

> `optional` **maxSelection**: `number`

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

Maximum number of entities that can be selected.

***

### multiselect?

> `optional` **multiselect**: `boolean`

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:33](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

Allow multiple selection of values

***

### path

> **path**: `string`

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:45](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

Absolute path of the collection.
May be not set if this hook is being used in a component and the path is
dynamic. If not set, the dialog won't open.

***

### selectedEntityIds?

> `optional` **selectedEntityIds**: `string`[]

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:51](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

If you are opening the dialog for the first time, you can select some
entity ids to be displayed first.

## Methods

### onMultipleEntitiesSelected()?

> `optional` **onMultipleEntitiesSelected**(`entities`): `void`

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

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

Defined in: [components/ReferenceTable/ReferenceSelectionTable.tsx:59](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceTable/ReferenceSelectionTable.tsx)

If `multiselect` is set to `false`, you will get the selected entity
in this callback.

#### Parameters

##### entity

[`Entity`](Entity)\<`any`\> | `null`

#### Returns

`void`
