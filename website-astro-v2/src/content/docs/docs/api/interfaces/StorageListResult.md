---
slug: "docs/api/interfaces/StorageListResult"
title: "StorageListResult"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / StorageListResult

# Interface: StorageListResult

Defined in: [types/storage.ts:130](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

Result returned by list().

## Properties

### items

> **items**: [`StorageReference`](StorageReference)[]

Defined in: [types/storage.ts:144](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

Objects in this directory.
You can call getMetadata() and getDownloadUrl() on them.

***

### nextPageToken?

> `optional` **nextPageToken**: `string`

Defined in: [types/storage.ts:148](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

If set, there might be more results for this list. Use this token to resume the list.

***

### prefixes

> **prefixes**: [`StorageReference`](StorageReference)[]

Defined in: [types/storage.ts:139](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

References to prefixes (sub-folders). You can call list() on them to
get its contents.

Folders are implicit based on '/' in the object paths.
For example, if a bucket has two objects '/a/b/1' and '/a/b/2', list('/a')
will return '/a/b' as a prefix.
