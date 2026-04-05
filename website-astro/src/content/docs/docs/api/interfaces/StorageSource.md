---
slug: "docs/api/interfaces/StorageSource"
title: "StorageSource"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / StorageSource

# Interface: StorageSource

Defined in: [types/src/controllers/storage.ts:83](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

## Properties

### deleteFile()

> **deleteFile**: (`path`, `bucket?`) => `Promise`\<`void`\>

Defined in: [types/src/controllers/storage.ts:120](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

Delete a file.

#### Parameters

##### path

`string`

##### bucket?

`string`

#### Returns

`Promise`\<`void`\>

***

### getDownloadURL()

> **getDownloadURL**: (`pathOrUrl`, `bucket?`) => `Promise`\<[`DownloadConfig`](DownloadConfig)\>

Defined in: [types/src/controllers/storage.ts:105](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

Convert a storage path or URL into a download configuration

#### Parameters

##### pathOrUrl

`string`

##### bucket?

`string`

#### Returns

`Promise`\<[`DownloadConfig`](DownloadConfig)\>

***

### getFile()

> **getFile**: (`path`, `bucket?`) => `Promise`\<`File` \| `null`\>

Defined in: [types/src/controllers/storage.ts:113](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

Get a file from a storage path.
It returns null if the file does not exist.

#### Parameters

##### path

`string`

##### bucket?

`string`

#### Returns

`Promise`\<`File` \| `null`\>

***

### list()

> **list**: (`path`, `options?`) => `Promise`\<[`StorageListResult`](StorageListResult)\>

Defined in: [types/src/controllers/storage.ts:127](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

List the contents of a path.

#### Parameters

##### path

`string`

##### options?

###### bucket?

`string`

###### maxResults?

`number`

###### pageToken?

`string`

#### Returns

`Promise`\<[`StorageListResult`](StorageListResult)\>

***

### uploadFile()

> **uploadFile**: (`file`) => `Promise`\<[`UploadFileResult`](UploadFileResult)\>

Defined in: [types/src/controllers/storage.ts:92](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/storage.ts)

Upload a file, specifying a name and a path

#### Parameters

##### file

[`UploadFileProps`](UploadFileProps)

#### Returns

`Promise`\<[`UploadFileResult`](UploadFileResult)\>
