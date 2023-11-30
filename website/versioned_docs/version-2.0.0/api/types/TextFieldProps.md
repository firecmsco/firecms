---
id: "TextFieldProps"
title: "Type alias: TextFieldProps<T>"
sidebar_label: "TextFieldProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **TextFieldProps**\<`T`\>: \{ `autoFocus?`: `boolean` ; `className?`: `string` ; `disabled?`: `boolean` ; `endAdornment?`: `React.ReactNode` ; `error?`: `boolean` ; `inputClassName?`: `string` ; `inputRef?`: `React.Ref`\<`any`\> ; `inputStyle?`: `React.CSSProperties` ; `invisible?`: `boolean` ; `label?`: `React.ReactNode` ; `multiline?`: `boolean` ; `onChange?`: (`event`: `React.ChangeEvent`\<`HTMLInputElement` \| `HTMLTextAreaElement`\>) => `void` ; `placeholder?`: `string` ; `rows?`: `number` ; `size?`: ``"small"`` \| ``"medium"`` ; `style?`: `React.CSSProperties` ; `type?`: [`InputType`](InputType.md) ; `value`: `T`  } & `Omit`\<`React.InputHTMLAttributes`\<`HTMLInputElement`\>, ``"size"``\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` \| `number` |

#### Defined in

[packages/firecms_core/src/components/TextField.tsx:30](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/components/TextField.tsx#L30)
