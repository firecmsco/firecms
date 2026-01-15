---
slug: "docs/api/interfaces/StorageReference"
title: "StorageReference"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / StorageReference

# Interface: StorageReference

Defined in: [types/storage.ts:156](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

Represents a reference to a Google Cloud Storage object. Developers can
upload, download, and delete objects, as well as get/set object metadata.

## Properties

### bucket

> **bucket**: `string`

Defined in: [types/storage.ts:171](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The name of the bucket containing this reference's object.

***

### fullPath

> **fullPath**: `string`

Defined in: [types/storage.ts:175](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The full path of this object.

***

### name

> **name**: `string`

Defined in: [types/storage.ts:180](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

The short name of this object, which is the last component of the full path.
For example, if fullPath is 'full/path/image.png', name is 'image.png'.

***

### parent

> **parent**: `StorageReference` \| `null`

Defined in: [types/storage.ts:186](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

A reference pointing to the parent location of this reference, or null if
this reference is the root.

***

### root

> **root**: `StorageReference`

Defined in: [types/storage.ts:167](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

A reference to the root of this object's bucket.

## Methods

### toString()

> **toString**(): `string`

Defined in: [types/storage.ts:162](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

Returns a gs:// URL for this object in the form
  `gs://<bucket>/<path>/<to>/<object>`

#### Returns

`string`

The gs:// URL.
