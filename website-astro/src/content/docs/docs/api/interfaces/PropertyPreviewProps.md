---
slug: "docs/api/interfaces/PropertyPreviewProps"
title: "PropertyPreviewProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PropertyPreviewProps

# Interface: PropertyPreviewProps\<P, CustomProps\>

Defined in: [types/src/components/PropertyPreviewProps.tsx:11](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

## Type Parameters

### P

`P` *extends* [`Property`](../type-aliases/Property)

### CustomProps

`CustomProps` = `unknown`

## Properties

### customProps?

> `optional` **customProps**: `CustomProps`

Defined in: [types/src/components/PropertyPreviewProps.tsx:47](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

Additional properties set by the developer

***

### fill?

> `optional` **fill**: `boolean`

Defined in: [types/src/components/PropertyPreviewProps.tsx:59](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

If true, image previews will fill their container completely.
Only applies to image type properties.

***

### height?

> `optional` **height**: `number`

Defined in: [types/src/components/PropertyPreviewProps.tsx:36](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

Max height assigned to the preview, depending on the context.
It may be undefined if unlimited.

***

### interactive?

> `optional` **interactive**: `boolean`

Defined in: [types/src/components/PropertyPreviewProps.tsx:53](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

If the preview should be interactive or not.
This applies only to videos.

***

### property

> **property**: `P`

Defined in: [types/src/components/PropertyPreviewProps.tsx:25](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

Property this display is related to, now strongly typed to P

***

### propertyKey?

> `optional` **propertyKey**: `string`

Defined in: [types/src/components/PropertyPreviewProps.tsx:15](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

Name of the property

***

### size

> **size**: [`PreviewSize`](../type-aliases/PreviewSize)

Defined in: [types/src/components/PropertyPreviewProps.tsx:30](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

Desired size of the preview, depending on the context.

***

### value

> **value**: [`InferPropertyType`](../type-aliases/InferPropertyType)\<`P`\>

Defined in: [types/src/components/PropertyPreviewProps.tsx:20](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

Current value of the property, inferred from the property schema P

***

### width?

> `optional` **width**: `number`

Defined in: [types/src/components/PropertyPreviewProps.tsx:42](https://github.com/rebasepro/rebase/blob/main/packages/types/src/components/PropertyPreviewProps.tsx)

Max height width to the preview, depending on the context.
It may be undefined if unlimited.
