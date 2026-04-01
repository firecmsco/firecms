---
slug: "docs/api/interfaces/UploadFileResult"
title: "UploadFileResult"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / UploadFileResult

# Interface: UploadFileResult

Defined in: [types/src/controllers/storage.ts:15](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/storage.ts)

## Properties

### bucket

> **bucket**: `string`

Defined in: [types/src/controllers/storage.ts:23](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/storage.ts)

Bucket where the file was uploaded

***

### path

> **path**: `string`

Defined in: [types/src/controllers/storage.ts:19](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/storage.ts)

Storage path including the file name where the file was uploaded.

***

### storageUrl?

> `optional` **storageUrl**: `string`

Defined in: [types/src/controllers/storage.ts:32](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/storage.ts)

Fully qualified storage URL for the uploaded file.

For example: `gs://my-bucket/path/to/file.png`.

This is optional for backwards compatibility.
