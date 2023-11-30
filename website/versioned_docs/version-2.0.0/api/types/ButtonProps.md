---
id: "ButtonProps"
title: "Type alias: ButtonProps<P>"
sidebar_label: "ButtonProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ButtonProps**\<`P`\>: `Omit`\<`P` extends ``"button"`` ? `React.ButtonHTMLAttributes`\<`HTMLButtonElement`\> : `React.ComponentProps`\<`P`\>, ``"onClick"``\> & \{ `className?`: `string` ; `disabled?`: `boolean` ; `fullWidth?`: `boolean` ; `onClick?`: `React.MouseEventHandler`\<`any`\> ; `size?`: ``"small"`` \| ``"medium"`` \| ``"large"`` ; `startIcon?`: `React.ReactNode` ; `variant?`: ``"filled"`` \| ``"outlined"`` \| ``"text"``  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends `React.ElementType` |

#### Defined in

[packages/firecms_core/src/components/Button.tsx:6](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/components/Button.tsx#L6)
