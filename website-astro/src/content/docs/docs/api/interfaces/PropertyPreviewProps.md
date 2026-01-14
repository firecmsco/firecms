---
slug: "docs/api/interfaces/PropertyPreviewProps"
title: "PropertyPreviewProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PropertyPreviewProps

# Interface: PropertyPreviewProps\<T, CustomProps\>

Defined in: [preview/PropertyPreviewProps.tsx:11](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

## Type Parameters

### T

`T` *extends* [`CMSType`](../type-aliases/CMSType) = `any`

### CustomProps

`CustomProps` = `any`

## Properties

### customProps?

> `optional` **customProps**: `CustomProps`

Defined in: [preview/PropertyPreviewProps.tsx:47](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

Additional properties set by the developer

***

### height?

> `optional` **height**: `number`

Defined in: [preview/PropertyPreviewProps.tsx:36](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

Max height assigned to the preview, depending on the context.
It may be undefined if unlimited.

***

### interactive?

> `optional` **interactive**: `boolean`

Defined in: [preview/PropertyPreviewProps.tsx:53](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

If the preview should be interactive or not.
This applies only to videos.

***

### property

> **property**: [`Property`](../type-aliases/Property)\<`T`\> \| [`ResolvedProperty`](../type-aliases/ResolvedProperty)\<`T`\>

Defined in: [preview/PropertyPreviewProps.tsx:25](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

Property this display is related to

***

### propertyKey?

> `optional` **propertyKey**: `string`

Defined in: [preview/PropertyPreviewProps.tsx:15](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

Name of the property

***

### size

> **size**: [`PreviewSize`](../type-aliases/PreviewSize)

Defined in: [preview/PropertyPreviewProps.tsx:30](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

Desired size of the preview, depending on the context.

***

### value

> **value**: `T`

Defined in: [preview/PropertyPreviewProps.tsx:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

Current value of the property

***

### width?

> `optional` **width**: `number`

Defined in: [preview/PropertyPreviewProps.tsx:42](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/preview/PropertyPreviewProps.tsx)

Max height width to the preview, depending on the context.
It may be undefined if unlimited.
