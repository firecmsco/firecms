---
slug: "docs/api/interfaces/DownloadMetadata"
title: "DownloadMetadata"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / DownloadMetadata

# Interface: DownloadMetadata

Defined in: [types/storage.ts:44](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The full set of object metadata, including read-only properties.

## Properties

### bucket

> **bucket**: `string`

Defined in: [types/storage.ts:48](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The bucket this object is contained in.

***

### contentType

> **contentType**: `string`

Defined in: [types/storage.ts:66](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

Type of the uploaded file
e.g. "image/jpeg"

***

### customMetadata

> **customMetadata**: `Record`\<`string`, `unknown`\>

Defined in: [types/storage.ts:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

***

### fullPath

> **fullPath**: `string`

Defined in: [types/storage.ts:52](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The full path of this object.

***

### name

> **name**: `string`

Defined in: [types/storage.ts:57](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The short name of this object, which is the last component of the full path.
For example, if fullPath is 'full/path/image.png', name is 'image.png'.

***

### size

> **size**: `number`

Defined in: [types/storage.ts:61](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The size of this object, in bytes.
