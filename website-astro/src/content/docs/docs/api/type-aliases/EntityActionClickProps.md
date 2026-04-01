---
slug: "docs/api/type-aliases/EntityActionClickProps"
title: "EntityActionClickProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityActionClickProps

# Type Alias: EntityActionClickProps\<M, USER\>

> **EntityActionClickProps**\<`M`, `USER`\> = `object`

Defined in: [types/src/types/entity\_actions.tsx:63](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

## Type Parameters

### M

`M` *extends* `object`

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [types/src/types/entity\_actions.tsx:68](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

***

### context

> **context**: [`RebaseContext`](RebaseContext)\<`USER`\>

Defined in: [types/src/types/entity\_actions.tsx:65](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

***

### entity?

> `optional` **entity**: [`Entity`](../interfaces/Entity)\<`M`\>

Defined in: [types/src/types/entity\_actions.tsx:64](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

***

### formContext?

> `optional` **formContext**: [`FormContext`](../interfaces/FormContext)

Defined in: [types/src/types/entity\_actions.tsx:74](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Optional form context, present if the action is being called from a form.
This allows you to access the form state and methods, including modifying the form values.

***

### highlightEntity()?

> `optional` **highlightEntity**: (`entity`) => `void`

Defined in: [types/src/types/entity\_actions.tsx:100](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Optional highlight function to highlight the entity in the collection view

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`Record`\<`string`, `unknown`\>\>

#### Returns

`void`

***

### navigateBack()?

> `optional` **navigateBack**: () => `void`

Defined in: [types/src/types/entity\_actions.tsx:111](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Optional function to navigate back (e.g. when deleting an entity or navigating from a form)

#### Returns

`void`

***

### onCollectionChange()?

> `optional` **onCollectionChange**: () => `void`

Defined in: [types/src/types/entity\_actions.tsx:116](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Callback to be called when the collection changes, e.g. after an entity is deleted or created.

#### Returns

`void`

***

### openEntityMode

> **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/src/types/entity\_actions.tsx:89](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

If the action is rendered in the form, is it open in a side panel or full screen?

***

### path?

> `optional` **path**: `string`

Defined in: [types/src/types/entity\_actions.tsx:67](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

***

### selectionController?

> `optional` **selectionController**: [`SelectionController`](SelectionController)

Defined in: [types/src/types/entity\_actions.tsx:94](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Optional selection controller, present if the action is being called from a collection view

***

### sideEntityController?

> `optional` **sideEntityController**: [`SideEntityController`](../interfaces/SideEntityController)

Defined in: [types/src/types/entity\_actions.tsx:79](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Present if this actions is being called from a side dialog only

***

### unhighlightEntity()?

> `optional` **unhighlightEntity**: (`entity`) => `void`

Defined in: [types/src/types/entity\_actions.tsx:106](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Optional unhighlight function to remove the highlight from the entity in the collection view

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`Record`\<`string`, `unknown`\>\>

#### Returns

`void`

***

### view

> **view**: `"collection"` \| `"form"`

Defined in: [types/src/types/entity\_actions.tsx:84](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/entity_actions.tsx)

Is the action being called from the collection view or from the entity form view?
