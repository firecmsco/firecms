---
id: "EntityCustomView"
title: "Type alias: EntityCustomView<M>"
sidebar_label: "EntityCustomView"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityCustomView**\<`M`\>: `Object`

You can use this builder to render a custom panel in the entity detail view.
It gets rendered as a tab.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Builder?` | `React.ComponentType`\<[`EntityCustomViewParams`](../interfaces/EntityCustomViewParams.md)\<`M`\>\> |
| `key` | `string` |
| `name` | `string` |

#### Defined in

[packages/firecms_core/src/types/collections.ts:428](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L428)
