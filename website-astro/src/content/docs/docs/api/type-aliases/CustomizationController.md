---
slug: "docs/api/type-aliases/CustomizationController"
title: "CustomizationController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / CustomizationController

# Type Alias: CustomizationController

> **CustomizationController** = `object`

Defined in: [types/customization\_controller.tsx:9](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

## Properties

### components?

> `optional` **components**: `object`

Defined in: [types/customization\_controller.tsx:56](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

#### missingReference?

> `optional` **missingReference**: `React.ComponentType`\<\{ `path`: `string`; \}\>

Component to render when a reference is missing

***

### dateTimeFormat?

> `optional` **dateTimeFormat**: `string`

Defined in: [types/customization\_controller.tsx:42](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

***

### entityActions?

> `optional` **entityActions**: [`EntityAction`](EntityAction)\<`any`, `any`\>[]

Defined in: [types/customization\_controller.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

List of actions that can be performed on entities.
These actions are displayed in the entity view and in the collection view.
You can later reuse these actions in the `entityActions` prop of a collection,
by specifying the `key` of the action.

***

### entityLinkBuilder?

> `optional` **entityLinkBuilder**: [`EntityLinkBuilder`](EntityLinkBuilder)

Defined in: [types/customization\_controller.tsx:14](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

Builder for generating utility links for entities

***

### entityViews?

> `optional` **entityViews**: [`EntityCustomView`](EntityCustomView)[]

Defined in: [types/customization\_controller.tsx:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

List of additional custom views for entities.
You can use the key to reference the custom view in
the `entityViews` prop of a collection.

You can also define an entity view from the UI.

***

### locale?

> `optional` **locale**: [`Locale`](Locale)

Defined in: [types/customization\_controller.tsx:47](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

Locale of the CMS, currently only affecting dates

***

### plugins?

> `optional` **plugins**: [`FireCMSPlugin`](FireCMSPlugin)\<`any`, `any`, `any`\>[]

Defined in: [types/customization\_controller.tsx:19](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

Use plugins to modify the behaviour of the CMS.

***

### propertyConfigs

> **propertyConfigs**: `Record`\<`string`, [`PropertyConfig`](PropertyConfig)\>

Defined in: [types/customization\_controller.tsx:54](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/customization_controller.tsx)

Record of custom form fields to be used in the CMS.
You can use the key to reference the custom field in
the `propertyConfig` prop of a property in a collection.
