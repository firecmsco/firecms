---
slug: "docs/api/interfaces/StorageSource"
title: "StorageSource"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / StorageSource

# Interface: StorageSource

Defined in: [types/storage.ts:74](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

## Properties

### deleteFile()

> **deleteFile**: (`path`, `bucket?`) => `Promise`\<`void`\>

Defined in: [types/storage.ts:111](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

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

> **getDownloadURL**: (`pathOrUrl`, `bucket?`) => `Promise`\<[`DownloadConfig`](/docs/api/interfaces/DownloadConfig)\>

Defined in: [types/storage.ts:96](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

Convert a storage path or URL into a download configuration

#### Parameters

##### pathOrUrl

`string`

##### bucket?

`string`

#### Returns

`Promise`\<[`DownloadConfig`](/docs/api/interfaces/DownloadConfig)\>

***

### getFile()

> **getFile**: (`path`, `bucket?`) => `Promise`\<`File` \| `null`\>

Defined in: [types/storage.ts:104](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

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

> **list**: (`path`, `options?`) => `Promise`\<[`StorageListResult`](/docs/api/interfaces/StorageListResult)\>

Defined in: [types/storage.ts:118](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

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

`Promise`\<[`StorageListResult`](/docs/api/interfaces/StorageListResult)\>

***

### uploadFile()

> **uploadFile**: (`file`) => `Promise`\<[`UploadFileResult`](/docs/api/interfaces/UploadFileResult)\>

Defined in: [types/storage.ts:83](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/storage.ts)

Upload a file, specifying a name and a path

#### Parameters

##### file

[`UploadFileProps`](/docs/api/interfaces/UploadFileProps)

#### Returns

`Promise`\<[`UploadFileResult`](/docs/api/interfaces/UploadFileResult)\>
