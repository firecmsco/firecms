---
id: "IconButtonProps"
title: "Type alias: IconButtonProps<C>"
sidebar_label: "IconButtonProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **IconButtonProps**\<`C`\>: `Omit`\<`C` extends ``"button"`` ? `React.ButtonHTMLAttributes`\<`HTMLButtonElement`\> : `React.ComponentProps`\<`C`\>, ``"onClick"``\> & \{ `component?`: `C` ; `disabled?`: `boolean` ; `onClick?`: `React.MouseEventHandler`\<`any`\> ; `shape?`: ``"circular"`` \| ``"square"`` ; `size?`: ``"medium"`` \| ``"small"`` \| ``"large"`` ; `toggled?`: `boolean` ; `variant?`: ``"ghost"`` \| ``"filled"``  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | extends `React.ElementType` |

#### Defined in

[packages/firecms_core/src/components/IconButton.tsx:5](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/components/IconButton.tsx#L5)
