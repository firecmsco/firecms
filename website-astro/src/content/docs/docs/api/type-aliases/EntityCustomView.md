---
slug: "docs/api/type-aliases/EntityCustomView"
title: "EntityCustomView"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCustomView

# Type Alias: EntityCustomView\<M\>

> **EntityCustomView**\<`M`\> = `object`

Defined in: [types/collections.ts:537](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

You can use this builder to render a custom panel in the entity detail view.
It gets rendered as a tab.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Properties

### Builder?

> `optional` **Builder**: `React.ComponentType`\<[`EntityCustomViewParams`](../interfaces/EntityCustomViewParams)\<`M`\>\>

Defined in: [types/collections.ts:565](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Builder for rendering the custom view

***

### includeActions?

> `optional` **includeActions**: `boolean` \| `"bottom"`

Defined in: [types/collections.ts:560](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If set to true, the actions of the entity (save, discard,delete) will be
included in the view. By default the actions are located in the right or bottom,
based on the screen size. You can force the actions to be located at the bottom
by setting this prop to "bottom".

***

### key

> **key**: `string`

Defined in: [types/collections.ts:542](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Key of this custom view.

***

### name

> **name**: `string`

Defined in: [types/collections.ts:547](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Name of this custom view.

***

### position?

> `optional` **position**: `"start"` \| `"end"`

Defined in: [types/collections.ts:570](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Position of this tab in the entity view. Defaults to `end`.

***

### tabComponent?

> `optional` **tabComponent**: `React.ReactNode`

Defined in: [types/collections.ts:552](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Render this custom view in the tab of the entity view, instead of the name
