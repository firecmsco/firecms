---
id: "useClipboardReturnType"
title: "Interface: useClipboardReturnType"
sidebar_label: "useClipboardReturnType"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### clearClipboard

• **clearClipboard**: () => `void`

#### Type declaration

▸ (): `void`

Clears the user clipboard.

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:63](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L63)

___

### clipboard

• **clipboard**: `string`

Current selected clipboard content.

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:58](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L58)

___

### copy

• **copy**: (`text?`: `string`) => `void`

#### Type declaration

▸ (`text?`): `void`

Use it to perform the copy operation

##### Parameters

| Name | Type |
| :------ | :------ |
| `text?` | `string` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:43](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L43)

___

### cut

• **cut**: () => `void`

#### Type declaration

▸ (): `void`

Use it to perform the cut operation

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:48](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L48)

___

### isCoppied

• **isCoppied**: `boolean`

Indicates wheater the content was successfully copied or not.

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:53](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L53)

___

### isSupported

• **isSupported**: () => `boolean`

#### Type declaration

▸ (): `boolean`

Check to see if the browser supports the new `navigator.clipboard` API.

##### Returns

`boolean`

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:68](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L68)

___

### ref

• **ref**: `MutableRefObject`\<`any`\>

Use ref to pull the text content from.

#### Defined in

[packages/firecms_core/src/hooks/useClipboard.tsx:38](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useClipboard.tsx#L38)
