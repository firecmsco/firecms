---
id: "SelectedCellProps"
title: "Type alias: SelectedCellProps<M>"
sidebar_label: "SelectedCellProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SelectedCellProps**\<`M`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cellRect` | `DOMRect` |
| `entity` | [`Entity`](../interfaces/Entity.md)\<`M`\> |
| `height` | `number` |
| `propertyKey` | `Extract`\<keyof `M`, `string`\> |
| `width` | `number` |

#### Defined in

[packages/firecms_core/src/types/collections.ts:508](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L508)
