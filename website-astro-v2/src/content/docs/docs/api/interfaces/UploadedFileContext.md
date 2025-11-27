---
slug: "docs/api/interfaces/UploadedFileContext"
title: "UploadedFileContext"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / UploadedFileContext

# Interface: UploadedFileContext

Defined in: [types/properties.ts:859](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Properties

### entityId?

> `optional` **entityId**: `string`

Defined in: [types/properties.ts:878](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Entity ID

***

### file

> **file**: `File`

Defined in: [types/properties.ts:863](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Uploaded file

***

### path?

> `optional` **path**: `string`

Defined in: [types/properties.ts:883](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Entity path. E.g. `products/PID/locales`

***

### property

> **property**: [`ResolvedStringProperty`](../type-aliases/ResolvedStringProperty) \| [`ResolvedArrayProperty`](../type-aliases/ResolvedArrayProperty)\<`T`, `ArrayT`\>

Defined in: [types/properties.ts:873](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property related to this upload

***

### propertyKey

> **propertyKey**: `string`

Defined in: [types/properties.ts:868](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property field name

***

### storage

> **storage**: [`StorageConfig`](../type-aliases/StorageConfig)

Defined in: [types/properties.ts:893](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Storage meta specified by the developer

***

### values

> **values**: `any`

Defined in: [types/properties.ts:888](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Values of the current entity
