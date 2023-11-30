---
id: "DownloadMetadata"
title: "Interface: DownloadMetadata"
sidebar_label: "DownloadMetadata"
sidebar_position: 0
custom_edit_url: null
---

The full set of object metadata, including read-only properties.

## Properties

### bucket

• **bucket**: `string`

The bucket this object is contained in.

#### Defined in

[packages/firecms_core/src/types/storage.ts:43](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L43)

___

### contentType

• **contentType**: `string`

Type of the uploaded file
e.g. "image/jpeg"

#### Defined in

[packages/firecms_core/src/types/storage.ts:61](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L61)

___

### customMetadata

• **customMetadata**: `Record`\<`string`, `unknown`\>

#### Defined in

[packages/firecms_core/src/types/storage.ts:63](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L63)

___

### fullPath

• **fullPath**: `string`

The full path of this object.

#### Defined in

[packages/firecms_core/src/types/storage.ts:47](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L47)

___

### name

• **name**: `string`

The short name of this object, which is the last component of the full path.
For example, if fullPath is 'full/path/image.png', name is 'image.png'.

#### Defined in

[packages/firecms_core/src/types/storage.ts:52](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L52)

___

### size

• **size**: `number`

The size of this object, in bytes.

#### Defined in

[packages/firecms_core/src/types/storage.ts:56](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L56)
