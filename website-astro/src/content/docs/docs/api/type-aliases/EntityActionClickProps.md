---
slug: "docs/api/type-aliases/EntityActionClickProps"
title: "EntityActionClickProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityActionClickProps

# Type Alias: EntityActionClickProps\<M, USER\>

> **EntityActionClickProps**\<`M`, `USER`\> = `object`

Defined in: [types/entity\_actions.tsx:63](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

## Type Parameters

### M

`M` *extends* `object`

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Properties

### collection?

> `optional` **collection**: [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

Defined in: [types/entity\_actions.tsx:69](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

***

### context

> **context**: [`FireCMSContext`](FireCMSContext)\<`USER`\>

Defined in: [types/entity\_actions.tsx:65](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

***

### entity?

> `optional` **entity**: [`Entity`](../interfaces/Entity)\<`M`\>

Defined in: [types/entity\_actions.tsx:64](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

***

### formContext?

> `optional` **formContext**: [`FormContext`](../interfaces/FormContext)

Defined in: [types/entity\_actions.tsx:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Optional form context, present if the action is being called from a form.
This allows you to access the form state and methods, including modifying the form values.

***

### fullIdPath?

> `optional` **fullIdPath**: `string`

Defined in: [types/entity\_actions.tsx:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

***

### fullPath?

> `optional` **fullPath**: `string`

Defined in: [types/entity\_actions.tsx:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

***

### highlightEntity()?

> `optional` **highlightEntity**: (`entity`) => `void`

Defined in: [types/entity\_actions.tsx:101](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Optional highlight function to highlight the entity in the collection view

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`any`\>

#### Returns

`void`

***

### navigateBack()?

> `optional` **navigateBack**: () => `void`

Defined in: [types/entity\_actions.tsx:112](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Optional function to navigate back (e.g. when deleting an entity or navigating from a form)

#### Returns

`void`

***

### onCollectionChange()?

> `optional` **onCollectionChange**: () => `void`

Defined in: [types/entity\_actions.tsx:117](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Callback to be called when the collection changes, e.g. after an entity is deleted or created.

#### Returns

`void`

***

### openEntityMode

> **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/entity\_actions.tsx:90](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

If the action is rendered in the form, is it open in a side panel or full screen?

***

### selectionController?

> `optional` **selectionController**: [`SelectionController`](SelectionController)

Defined in: [types/entity\_actions.tsx:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Optional selection controller, present if the action is being called from a collection view

***

### sideEntityController?

> `optional` **sideEntityController**: [`SideEntityController`](../interfaces/SideEntityController)

Defined in: [types/entity\_actions.tsx:80](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Present if this actions is being called from a side dialog only

***

### unhighlightEntity()?

> `optional` **unhighlightEntity**: (`entity`) => `void`

Defined in: [types/entity\_actions.tsx:107](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Optional unhighlight function to remove the highlight from the entity in the collection view

#### Parameters

##### entity

[`Entity`](../interfaces/Entity)\<`any`\>

#### Returns

`void`

***

### view

> **view**: `"collection"` \| `"form"`

Defined in: [types/entity\_actions.tsx:85](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Is the action being called from the collection view or from the entity form view?
