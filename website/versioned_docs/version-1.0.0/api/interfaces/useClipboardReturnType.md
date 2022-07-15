---
id: "useClipboardReturnType"
title: "Interface: useClipboardReturnType"
sidebar_label: "useClipboardReturnType"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### clipboard

• **clipboard**: `string`

Current selected clipboard content.

#### Defined in

[hooks/useClipboard.tsx:65](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L65)

___

### isCoppied

• **isCoppied**: `boolean`

Indicates wheater the content was successfully copied or not.

#### Defined in

[hooks/useClipboard.tsx:60](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L60)

___

### ref

• **ref**: `MutableRefObject`<`any`\>

Use ref to pull the text content from.

#### Defined in

[hooks/useClipboard.tsx:45](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L45)

## Methods

### clearClipboard

▸ **clearClipboard**(): `void`

Clears the user clipboard.

#### Returns

`void`

#### Defined in

[hooks/useClipboard.tsx:70](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L70)

___

### copy

▸ **copy**(`text?`): `void`

Use it to perform the copy operation

#### Parameters

| Name | Type |
| :------ | :------ |
| `text?` | `string` |

#### Returns

`void`

#### Defined in

[hooks/useClipboard.tsx:50](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L50)

___

### cut

▸ **cut**(): `void`

Use it to perform the cut operation

#### Returns

`void`

#### Defined in

[hooks/useClipboard.tsx:55](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L55)

___

### isSupported

▸ **isSupported**(): `boolean`

Check to see if the browser supports the new `navigator.clipboard` API.

#### Returns

`boolean`

#### Defined in

[hooks/useClipboard.tsx:75](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useClipboard.tsx#L75)
