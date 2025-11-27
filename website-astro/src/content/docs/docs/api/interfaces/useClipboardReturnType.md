---
slug: "docs/api/interfaces/useClipboardReturnType"
title: "useClipboardReturnType"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useClipboardReturnType

# Interface: useClipboardReturnType

Defined in: [hooks/useClipboard.tsx:34](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

## Properties

### clearClipboard()

> **clearClipboard**: () => `void`

Defined in: [hooks/useClipboard.tsx:63](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Clears the user clipboard.

#### Returns

`void`

***

### clipboard

> **clipboard**: `string`

Defined in: [hooks/useClipboard.tsx:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Current selected clipboard content.

***

### copy()

> **copy**: (`text?`) => `void`

Defined in: [hooks/useClipboard.tsx:43](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Use it to perform the copy operation

#### Parameters

##### text?

`string`

#### Returns

`void`

***

### cut()

> **cut**: () => `void`

Defined in: [hooks/useClipboard.tsx:48](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Use it to perform the cut operation

#### Returns

`void`

***

### isCoppied

> **isCoppied**: `boolean`

Defined in: [hooks/useClipboard.tsx:53](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Indicates wheater the content was successfully copied or not.

***

### isSupported()

> **isSupported**: () => `boolean`

Defined in: [hooks/useClipboard.tsx:68](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Check to see if the browser supports the new `navigator.clipboard` API.

#### Returns

`boolean`

***

### ref

> **ref**: `MutableRefObject`\<`any`\>

Defined in: [hooks/useClipboard.tsx:38](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useClipboard.tsx)

Use ref to pull the text content from.
