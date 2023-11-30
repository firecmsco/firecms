---
id: "StorageConfig"
title: "Interface: StorageConfig"
sidebar_label: "StorageConfig"
sidebar_position: 0
custom_edit_url: null
---

Additional configuration related to Storage related fields

## Properties

### acceptedFiles

• `Optional` **acceptedFiles**: `string`[]

File MIME types that can be uploaded to this reference. Don't specify for
all.
Note that you can also use the asterisk notation, so `image/*`
accepts any image file, and so on.

#### Defined in

[packages/firecms_core/src/types/properties.ts:706](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L706)

___

### fileName

• `Optional` **fileName**: `string` \| (`context`: [`UploadedFileContext`](UploadedFileContext.md)) => `string` \| `Promise`\<`string`\>

You can use this prop to customize the uploaded filename.
You can use a function as a callback or a string where you
specify some placeholders that get replaced with the corresponding values.
- {file} - Full file name
- {file.name} - Name of the file without extension
- {file.ext} - Extension of the file
- {rand} - Random value used to avoid name collisions
- {entityId} - ID of the entity
- {propertyKey} - ID of this property
- {path} - Path of this entity

**`Param`**

#### Defined in

[packages/firecms_core/src/types/properties.ts:735](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L735)

___

### imageCompression

• `Optional` **imageCompression**: [`ImageCompression`](ImageCompression.md)

Use client side image compression and resizing
Will only be applied to these MIME types: image/jpeg, image/png and image/webp

#### Defined in

[packages/firecms_core/src/types/properties.ts:712](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L712)

___

### maxSize

• `Optional` **maxSize**: `number`

Define maximal file size in bytes

#### Defined in

[packages/firecms_core/src/types/properties.ts:767](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L767)

___

### metadata

• `Optional` **metadata**: `Record`\<`string`, `unknown`\>

Specific metadata set in your uploaded file.
For the default Firebase implementation, the values passed here are of type
`firebase.storage.UploadMetadata`

#### Defined in

[packages/firecms_core/src/types/properties.ts:719](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L719)

___

### postProcess

• `Optional` **postProcess**: (`pathOrUrl`: `string`) => `Promise`\<`string`\>

#### Type declaration

▸ (`pathOrUrl`): `Promise`\<`string`\>

Postprocess the saved value (storage path or URL)
after it has been resolved.

##### Parameters

| Name | Type |
| :------ | :------ |
| `pathOrUrl` | `string` |

##### Returns

`Promise`\<`string`\>

#### Defined in

[packages/firecms_core/src/types/properties.ts:773](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L773)

___

### storagePath

• **storagePath**: `string` \| (`context`: [`UploadedFileContext`](UploadedFileContext.md)) => `string`

Absolute path in your bucket.

You can use a function as a callback or a string where you
specify some placeholders that get replaced with the corresponding values.
- {file} - Full file name
- {file.name} - Name of the file without extension
- {file.ext} - Extension of the file
- {rand} - Random value used to avoid name collisions
- {entityId} - ID of the entity
- {propertyKey} - ID of this property
- {path} - Path of this entity

#### Defined in

[packages/firecms_core/src/types/properties.ts:750](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L750)

___

### storeUrl

• `Optional` **storeUrl**: `boolean`

When set to true, this flag indicates that the download URL of the file
will be saved in the datasource, instead of the storage path.

Note that the generated URL may use a token that, if disabled, may
make the URL unusable and lose the original reference to Cloud Storage,
so it is not encouraged to use this flag.

Defaults to false.

#### Defined in

[packages/firecms_core/src/types/properties.ts:762](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L762)
