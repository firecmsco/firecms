---
slug: "docs/api/interfaces/EntitySidePanelProps"
title: "EntitySidePanelProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntitySidePanelProps

# Interface: EntitySidePanelProps\<M\>

Defined in: [types/side\_entity\_controller.tsx:11](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Props used to open a side dialog

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### allowFullScreen?

> `optional` **allowFullScreen**: `boolean`

Defined in: [types/side\_entity\_controller.tsx:83](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Allow the user to open the entity fullscreen

***

### closeOnSave?

> `optional` **closeOnSave**: `boolean`

Defined in: [types/side\_entity\_controller.tsx:73](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Should this panel close when saving

***

### collection?

> `optional` **collection**: [`EntityCollection`](EntityCollection)\<`M`, `any`\> \| [`ResolvedEntityCollection`](../type-aliases/ResolvedEntityCollection)\<`M`\>

Defined in: [types/side\_entity\_controller.tsx:49](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Collection representing the entities of this view.
If you leave it blank it will be induced by your navigation

***

### copy?

> `optional` **copy**: `boolean`

Defined in: [types/side\_entity\_controller.tsx:31](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Set this flag to true if you want to make a copy of an existing entity

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [types/side\_entity\_controller.tsx:26](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

ID of the entity, if not set, it means we are creating a new entity

***

### formProps?

> `optional` **formProps**: `Partial`\<[`EntityFormProps`](../type-aliases/EntityFormProps)\<`M`\>\>

Defined in: [types/side\_entity\_controller.tsx:78](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Override some form properties

***

### fullIdPath?

> `optional` **fullIdPath**: `string`

Defined in: [types/side\_entity\_controller.tsx:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Full CMS path of the entity, including the collection and sub-collections.

***

### onClose()?

> `optional` **onClose**: () => `void`

Defined in: [types/side\_entity\_controller.tsx:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Callback when the dialog is closed

#### Returns

`void`

***

### onUpdate()?

> `optional` **onUpdate**: (`params`) => `void`

Defined in: [types/side\_entity\_controller.tsx:63](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Callback when the entity is updated

#### Parameters

##### params

###### entity

[`Entity`](Entity)\<`any`\>

#### Returns

`void`

***

### path

> **path**: `string`

Defined in: [types/side\_entity\_controller.tsx:16](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Absolute path of the entity

***

### selectedTab?

> `optional` **selectedTab**: `string`

Defined in: [types/side\_entity\_controller.tsx:37](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Open the entity with a selected sub-collection view. If the panel for this
entity was already open, it is replaced.

***

### updateUrl?

> `optional` **updateUrl**: `boolean`

Defined in: [types/side\_entity\_controller.tsx:57](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Should update the URL when opening the dialog.
Consider that if the collection that you provide is not defined in the base
config of your `FireCMS` component, you will not be able to recreate
the state if copying the URL to a different window.

***

### width?

> `optional` **width**: `string` \| `number`

Defined in: [types/side\_entity\_controller.tsx:43](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/side_entity_controller.tsx)

Use this prop to override the width of the form view.
e.g. "600px"
