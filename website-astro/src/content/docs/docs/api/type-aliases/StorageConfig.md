---
slug: "docs/api/type-aliases/StorageConfig"
title: "StorageConfig"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / StorageConfig

# Type Alias: StorageConfig

> **StorageConfig** = `object`

Defined in: [types/properties.ts:765](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Additional configuration related to Storage related fields

## Properties

### acceptedFiles?

> `optional` **acceptedFiles**: [`FileType`](FileType)[]

Defined in: [types/properties.ts:773](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

File MIME types that can be uploaded to this reference. Don't specify for
all.
Note that you can also use the asterisk notation, so `image/*`
accepts any image file, and so on.

***

### fileName?

> `optional` **fileName**: `string` \| (`context`) => `string` \| `Promise`\<`string`\>

Defined in: [types/properties.ts:802](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use this prop to customize the uploaded filename.
You can use a function as a callback or a string where you
specify some placeholders that get replaced with the corresponding values.
- `{file}` - Full file name
- `{file.name}` - Name of the file without extension
- `{file.ext}` - Extension of the file
- `{rand}` - Random value used to avoid name collisions
- `{entityId}` - ID of the entity
- `{propertyKey}` - ID of this property
- `{path}` - Path of this entity

#### Param

***

### imageCompression?

> `optional` **imageCompression**: [`ImageCompression`](../interfaces/ImageCompression)

Defined in: [types/properties.ts:779](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Use client side image compression and resizing
Will only be applied to these MIME types: image/jpeg, image/png and image/webp

***

### maxSize?

> `optional` **maxSize**: `number`

Defined in: [types/properties.ts:834](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Define maximal file size in bytes

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [types/properties.ts:786](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Specific metadata set in your uploaded file.
For the default Firebase implementation, the values passed here are of type
`firebase.storage.UploadMetadata`

***

### postProcess()?

> `optional` **postProcess**: (`pathOrUrl`) => `Promise`\<`string`\>

Defined in: [types/properties.ts:847](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Postprocess the saved value (storage path or URL)
after it has been resolved.

#### Parameters

##### pathOrUrl

`string`

#### Returns

`Promise`\<`string`\>

***

### previewUrl()?

> `optional` **previewUrl**: (`fileName`) => `string`

Defined in: [types/properties.ts:853](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use this prop in order to provide a custom preview URL.
Useful when the file's path is different from the original field value

#### Parameters

##### fileName

`string`

#### Returns

`string`

***

### processFile()?

> `optional` **processFile**: (`file`) => `Promise`\<`File`\> \| `undefined`

Defined in: [types/properties.ts:841](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Use this callback to process the file before uploading it to the storage.
If nothing is returned, the file is uploaded as it is.

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`File`\> \| `undefined`

***

### storagePath

> **storagePath**: `string` \| (`context`) => `string`

Defined in: [types/properties.ts:817](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Absolute path in your bucket.

You can use a function as a callback or a string where you
specify some placeholders that get replaced with the corresponding values.
- `{file}` - Full file name
- `{file.name}` - Name of the file without extension
- `{file.ext}` - Extension of the file
- `{rand}` - Random value used to avoid name collisions
- `{entityId}` - ID of the entity
- `{propertyKey}` - ID of this property
- `{path}` - Path of this entity

***

### storeUrl?

> `optional` **storeUrl**: `boolean`

Defined in: [types/properties.ts:829](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

When set to true, this flag indicates that the download URL of the file
will be saved in the datasource, instead of the storage path.

Note that the generated URL may use a token that, if disabled, may
make the URL unusable and lose the original reference to Cloud Storage,
so it is not encouraged to use this flag.

Defaults to false.
