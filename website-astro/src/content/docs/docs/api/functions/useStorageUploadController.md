---
slug: "docs/api/functions/useStorageUploadController"
title: "useStorageUploadController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useStorageUploadController

# Function: useStorageUploadController()

> **useStorageUploadController**\<`M`\>(`__namedParameters`): `object`

Defined in: [core/src/util/useStorageUploadController.tsx:33](https://github.com/rebasepro/rebase/blob/main/packages/core/src/util/useStorageUploadController.tsx)

## Type Parameters

### M

`M` *extends* `object`

## Parameters

### \_\_namedParameters

#### disabled

`boolean`

#### entityId?

`string` \| `number`

#### entityValues

`M`

#### onChange

(`value`) => `void`

#### path?

`string`

#### property

[`StringProperty`](../interfaces/StringProperty) \| [`ArrayProperty`](../interfaces/ArrayProperty)

#### propertyKey

`string`

#### storageSource

[`StorageSource`](../interfaces/StorageSource)

#### value

`string` \| `string`[] \| `null`

## Returns

`object`

### fileNameBuilder()

> **fileNameBuilder**: (`file`) => `Promise`\<`string`\>

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`string`\>

### internalValue

> **internalValue**: [`StorageFieldItem`](../interfaces/StorageFieldItem)[]

### multipleFilesSupported

> **multipleFilesSupported**: `boolean`

### onFilesAdded()

> **onFilesAdded**: (`acceptedFiles`) => `Promise`\<`void`\>

#### Parameters

##### acceptedFiles

`File`[]

#### Returns

`Promise`\<`void`\>

### onFileUploadComplete()

> **onFileUploadComplete**: (`uploadedPath`, `entry`, `metadata?`, `uploadedUrl?`) => `Promise`\<`void`\>

#### Parameters

##### uploadedPath

`string`

##### entry

[`StorageFieldItem`](../interfaces/StorageFieldItem)

##### metadata?

`any`

##### uploadedUrl?

`string`

#### Returns

`Promise`\<`void`\>

### onFileUploadError()

> **onFileUploadError**: (`entry`) => `void`

#### Parameters

##### entry

[`StorageFieldItem`](../interfaces/StorageFieldItem)

#### Returns

`void`

### setInternalValue

> **setInternalValue**: `Dispatch`\<`SetStateAction`\<[`StorageFieldItem`](../interfaces/StorageFieldItem)[]\>\>

### storage

> **storage**: [`StorageConfig`](../type-aliases/StorageConfig)

### storagePathBuilder()

> **storagePathBuilder**: (`file`) => `string`

#### Parameters

##### file

`File`

#### Returns

`string`
