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

[packages/firecms_core/src/hooks/useClipboard.tsx:31](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L31)

___

### disableClipboardAPI

• `Optional` **disableClipboardAPI**: `boolean`

Disables the new clipboard API `navigator.clipboard` even if
it is supported.

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:26](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L26)

___

### onError

• `Optional` **onError**: (`error`: `string`) => `void`

#### Type declaration

▸ (`error`): `void`

Triggers when the hook encounters an error.
If passed hook won't throw an error.

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `string` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:20](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L20)

___

### onSuccess

• `Optional` **onSuccess**: (`text`: `string`) => `void`

#### Type declaration

▸ (`text`): `void`

It's callback function that is called after the `copy` command
is executed.

##### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:12](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L12)
