---
slug: "docs/api/interfaces/StorageFieldItem"
title: "StorageFieldItem"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / StorageFieldItem

# Interface: StorageFieldItem

Defined in: [core/src/util/useStorageUploadController.tsx:24](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)

Internal representation of an item in the storage
It can have two states, having a storagePathOrDownloadUrl set,
which means the file has been uploaded, and it is rendered as a preview
Or have a pending file being uploaded.

## Properties

### file?

> `optional` **file**: `File`

Defined in: [core/src/util/useStorageUploadController.tsx:27](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)

***

### fileName?

> `optional` **fileName**: `string`

Defined in: [core/src/util/useStorageUploadController.tsx:28](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)

***

### id

> **id**: `number`

Defined in: [core/src/util/useStorageUploadController.tsx:25](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)

***

### metadata?

> `optional` **metadata**: `any`

Defined in: [core/src/util/useStorageUploadController.tsx:29](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)

***

### size

> **size**: [`PreviewSize`](../type-aliases/PreviewSize)

Defined in: [core/src/util/useStorageUploadController.tsx:30](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)

***

### storagePathOrDownloadUrl?

> `optional` **storagePathOrDownloadUrl**: `string`

Defined in: [core/src/util/useStorageUploadController.tsx:26](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)
