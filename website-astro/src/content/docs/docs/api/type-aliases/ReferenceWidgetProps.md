---
slug: "docs/api/type-aliases/ReferenceWidgetProps"
title: "ReferenceWidgetProps"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ReferenceWidgetProps

# Type Alias: ReferenceWidgetProps\<M\>

> **ReferenceWidgetProps**\<`M`\> = `object`

Defined in: [components/ReferenceWidget.tsx:9](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Properties

### className?

> `optional` **className**: `string`

Defined in: [components/ReferenceWidget.tsx:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [components/ReferenceWidget.tsx:22](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### forceFilter?

> `optional` **forceFilter**: [`FilterValues`](/docs/api/type-aliases/FilterValues)\<`string`\>

Defined in: [components/ReferenceWidget.tsx:27](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

Allow selection of entities that pass the given filter only.

***

### includeEntityLink?

> `optional` **includeEntityLink**: `boolean`

Defined in: [components/ReferenceWidget.tsx:31](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### includeId?

> `optional` **includeId**: `boolean`

Defined in: [components/ReferenceWidget.tsx:30](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### multiselect?

> `optional` **multiselect**: `boolean`

Defined in: [components/ReferenceWidget.tsx:11](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### name?

> `optional` **name**: `string`

Defined in: [components/ReferenceWidget.tsx:10](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### onMultipleReferenceSelected()?

> `optional` **onMultipleReferenceSelected**: (`params`) => `void`

Defined in: [components/ReferenceWidget.tsx:17](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

#### Parameters

##### params

###### entities

[`Entity`](/docs/api/interfaces/Entity)\<`M`\>[] \| `null`

###### references

[`EntityReference`](/docs/api/classes/EntityReference)[] \| `null`

#### Returns

`void`

***

### onReferenceSelected()?

> `optional` **onReferenceSelected**: (`params`) => `void`

Defined in: [components/ReferenceWidget.tsx:13](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

#### Parameters

##### params

###### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\> \| `null`

###### reference

[`EntityReference`](/docs/api/classes/EntityReference) \| `null`

#### Returns

`void`

***

### path

> **path**: `string`

Defined in: [components/ReferenceWidget.tsx:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### previewProperties?

> `optional` **previewProperties**: `string`[]

Defined in: [components/ReferenceWidget.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### size

> **size**: [`PreviewSize`](/docs/api/type-aliases/PreviewSize)

Defined in: [components/ReferenceWidget.tsx:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)

***

### value

> **value**: [`EntityReference`](/docs/api/classes/EntityReference) \| [`EntityReference`](/docs/api/classes/EntityReference)[] \| `null`

Defined in: [components/ReferenceWidget.tsx:12](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/components/ReferenceWidget.tsx)
