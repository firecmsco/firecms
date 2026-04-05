---
slug: "docs/api/interfaces/EntityCustomViewParams"
title: "EntityCustomViewParams"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCustomViewParams

# Interface: EntityCustomViewParams\<M\>

Defined in: [types/src/types/collections.ts:681](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Parameters passed to the builder in charge of rendering a custom panel for
an entity view.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### collection

> **collection**: [`EntityCollection`](EntityCollection)\<`M`\>

Defined in: [types/src/types/collections.ts:686](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

collection used by this entity

***

### entity?

> `optional` **entity**: [`Entity`](Entity)\<`M`\>

Defined in: [types/src/types/collections.ts:691](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Entity that this view refers to. It can be undefined if the entity is new

***

### formContext

> **formContext**: [`FormContext`](FormContext)

Defined in: [types/src/types/collections.ts:703](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Use the form context to access the form state and methods

***

### modifiedValues?

> `optional` **modifiedValues**: `M`

Defined in: [types/src/types/collections.ts:698](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Modified values in the form that have not been saved yet.
If the entity is not new and the values are not modified, these values
are the same as in `entity`

***

### parentCollectionIds?

> `optional` **parentCollectionIds**: `string`[]

Defined in: [types/src/types/collections.ts:708](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

If this is a subcollection, this is the path of the parent collections
