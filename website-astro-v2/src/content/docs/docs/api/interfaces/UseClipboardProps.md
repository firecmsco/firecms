---
slug: "docs/api/interfaces/UseClipboardProps"
title: "UseClipboardProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / UseClipboardProps

# Interface: UseClipboardProps

Defined in: [hooks/useClipboard.tsx:5](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

## Properties

### copiedDuration?

> `optional` **copiedDuration**: `number`

Defined in: [hooks/useClipboard.tsx:31](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

revert back the isCopied flag to false again if a value is set.

***

### disableClipboardAPI?

> `optional` **disableClipboardAPI**: `boolean`

Defined in: [hooks/useClipboard.tsx:26](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Disables the new clipboard API `navigator.clipboard` even if
it is supported.

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [hooks/useClipboard.tsx:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Triggers when the hook encounters an error.
If passed hook won't throw an error.

#### Parameters

##### error

`string`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`text`) => `void`

Defined in: [hooks/useClipboard.tsx:12](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

It's callback function that is called after the `copy` command
is executed.

#### Parameters

##### text

`string`

#### Returns

`void`
