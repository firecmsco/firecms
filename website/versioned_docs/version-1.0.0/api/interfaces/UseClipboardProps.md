---
id: "UseClipboardProps"
title: "Interface: UseClipboardProps"
sidebar_label: "UseClipboardProps"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### copiedDuration

• `Optional` **copiedDuration**: `number`

revert back the isCopied flag to false again if a value is set.

#### Defined in

[hooks/useClipboard.tsx:38](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L38)

___

### disableClipboardAPI

• `Optional` **disableClipboardAPI**: `boolean`

Disables the new clipboard API `navigator.clipboard` even if
it is supported.

#### Defined in

[hooks/useClipboard.tsx:33](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L33)

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

Triggers when the hook encounters an error.
If passed hook won't throw an error.

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `string` |

#### Returns

`void`

#### Defined in

[hooks/useClipboard.tsx:27](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L27)

___

### onSuccess

▸ `Optional` **onSuccess**(`text`): `void`

It's callback function that is called after the `copy` command
is executed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`void`

#### Defined in

[hooks/useClipboard.tsx:19](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L19)
