---
slug: "docs/api/interfaces/UploadedFileContext"
title: "UploadedFileContext"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / UploadedFileContext

# Interface: UploadedFileContext

Defined in: [types/src/types/properties.ts:906](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

## Properties

### entityId?

> `optional` **entityId**: `string` \| `number`

Defined in: [types/src/types/properties.ts:925](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Entity ID

***

### file

> **file**: `File`

Defined in: [types/src/types/properties.ts:910](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Uploaded file

***

### path?

> `optional` **path**: `string`

Defined in: [types/src/types/properties.ts:930](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Entity path. E.g. `products/PID/locales`

***

### property

> **property**: [`StringProperty`](StringProperty) \| [`ArrayProperty`](ArrayProperty)

Defined in: [types/src/types/properties.ts:920](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Property related to this upload

***

### propertyKey

> **propertyKey**: `string`

Defined in: [types/src/types/properties.ts:915](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Property field name

***

### storage

> **storage**: [`StorageConfig`](../type-aliases/StorageConfig)

Defined in: [types/src/types/properties.ts:940](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Storage meta specified by the developer

***

### values

> **values**: `any`

Defined in: [types/src/types/properties.ts:935](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Values of the current entity
