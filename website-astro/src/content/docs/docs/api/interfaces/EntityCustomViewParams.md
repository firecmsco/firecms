---
slug: "docs/api/interfaces/EntityCustomViewParams"
title: "EntityCustomViewParams"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCustomViewParams

# Interface: EntityCustomViewParams\<M\>

Defined in: [types/collections.ts:578](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Parameters passed to the builder in charge of rendering a custom panel for
an entity view.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [types/collections.ts:583](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

collection used by this entity

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/collections.ts:588](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Entity that this view refers to. It can be undefined if the entity is new

***

### formContext

> **formContext**: [`FormContext`](FormContext)

Defined in: [types/collections.ts:600](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Use the form context to access the form state and methods

***

### modifiedValues?

> `optional` **modifiedValues**: `M`

Defined in: [types/collections.ts:595](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Modified values in the form that have not been saved yet.
If the entity is not new and the values are not modified, these values
are the same as in `entity`

***

### parentCollectionIds?

> `optional` **parentCollectionIds**: `string`[]

Defined in: [types/collections.ts:605](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If this is a subcollection, this is the path of the parent collections
