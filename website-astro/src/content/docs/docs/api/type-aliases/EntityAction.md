---
slug: "docs/api/type-aliases/EntityAction"
title: "EntityAction"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityAction

# Type Alias: EntityAction\<M, USER\>

> **EntityAction**\<`M`, `USER`\> = `object`

Defined in: [types/entity\_actions.tsx:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

An entity action is a custom action that can be performed on an entity.
They are displayed in the entity view and in the collection view.

## Type Parameters

### M

`M` *extends* `object` = `any`

### USER

`USER` *extends* [`User`](User) = [`User`](User)

## Properties

### collapsed?

> `optional` **collapsed**: `boolean`

Defined in: [types/entity\_actions.tsx:54](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Show this action collapsed in the menu of the collection view.
Defaults to true
If false, the action will be shown in the menu

***

### icon?

> `optional` **icon**: `React.ReactElement`

Defined in: [types/entity\_actions.tsx:35](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Icon of the action

***

### includeInForm?

> `optional` **includeInForm**: `boolean`

Defined in: [types/entity\_actions.tsx:59](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Show this action in the form, defaults to true

***

### isEnabled()?

> `optional` **isEnabled**: (`props`) => `boolean`

Defined in: [types/entity\_actions.tsx:47](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Optional callback in case you want to disable the action

#### Parameters

##### props

[`EntityActionClickProps`](EntityActionClickProps)\<`M`, `USER`\>

#### Returns

`boolean`

***

### key?

> `optional` **key**: `string`

Defined in: [types/entity\_actions.tsx:30](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Key of the action. You only need to provide this if you want to
override the default actions, or if you are not passing the action
directly to the `entityActions` prop of a collection.
You can define your actions at the app level, in which case you
must provide a key.
The default actions are:
- edit
- delete
- copy

***

### name

> **name**: `string`

Defined in: [types/entity\_actions.tsx:17](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Title of the action

***

### onClick()

> **onClick**: (`props`) => `Promise`\<`void`\> \| `void`

Defined in: [types/entity\_actions.tsx:41](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/entity_actions.tsx)

Callback when the action is clicked

#### Parameters

##### props

[`EntityActionClickProps`](EntityActionClickProps)\<`M`, `USER`\>

#### Returns

`Promise`\<`void`\> \| `void`
