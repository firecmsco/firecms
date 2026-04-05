---
slug: "docs/api/interfaces/StorageReference"
title: "StorageReference"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / StorageReference

# Interface: StorageReference

Defined in: [types/src/controllers/storage.ts:165](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

Represents a reference to a Google Cloud Storage object. Developers can
upload, download, and delete objects, as well as get/set object metadata.

## Properties

### bucket

> **bucket**: `string`

Defined in: [types/src/controllers/storage.ts:180](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The name of the bucket containing this reference's object.

***

### fullPath

> **fullPath**: `string`

Defined in: [types/src/controllers/storage.ts:184](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The full path of this object.

***

### name

> **name**: `string`

Defined in: [types/src/controllers/storage.ts:189](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

The short name of this object, which is the last component of the full path.
For example, if path is 'full/path/image.png', name is 'image.png'.

***

### parent

> **parent**: `StorageReference` \| `null`

Defined in: [types/src/controllers/storage.ts:195](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

A reference pointing to the parent location of this reference, or null if
this reference is the root.

***

### root

> **root**: `StorageReference`

Defined in: [types/src/controllers/storage.ts:176](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

A reference to the root of this object's bucket.

## Methods

### toString()

> **toString**(): `string`

Defined in: [types/src/controllers/storage.ts:171](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

Returns a gs:// URL for this object in the form
  `gs://<bucket>/<path>/<to>/<object>`

#### Returns

`string`

The gs:// URL.
