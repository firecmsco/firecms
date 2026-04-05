---
slug: "docs/api/interfaces/DownloadMetadata"
title: "DownloadMetadata"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DownloadMetadata

# Interface: DownloadMetadata

Defined in: [types/src/controllers/storage.ts:53](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The full set of object metadata, including read-only properties.

## Properties

### bucket

> **bucket**: `string`

Defined in: [types/src/controllers/storage.ts:57](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The bucket this object is contained in.

***

### contentType

> **contentType**: `string`

Defined in: [types/src/controllers/storage.ts:75](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

Type of the uploaded file
e.g. "image/jpeg"

***

### customMetadata

> **customMetadata**: `Record`\<`string`, `unknown`\>

Defined in: [types/src/controllers/storage.ts:77](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

***

### fullPath

> **fullPath**: `string`

Defined in: [types/src/controllers/storage.ts:61](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The full path of this object.

***

### name

> **name**: `string`

Defined in: [types/src/controllers/storage.ts:66](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The short name of this object, which is the last component of the full path.
For example, if path is 'full/path/image.png', name is 'image.png'.

***

### size

> **size**: `number`

Defined in: [types/src/controllers/storage.ts:70](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The size of this object, in bytes.
