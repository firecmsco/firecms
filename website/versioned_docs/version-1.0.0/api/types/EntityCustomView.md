---
id: "EntityCustomView"
title: "Type alias: EntityCustomView<M>"
sidebar_label: "EntityCustomView"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityCustomView**<`M`\>: `Object`

You can use this builder to render a custom panel in the entity detail view.
It gets rendered as a tab.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `path` | `string` |
| `builder` | (`extraActionsParams`: [`EntityCustomViewParams`](../interfaces/EntityCustomViewParams)<`M`\>) => `ReactNode` |

#### Defined in

[models/entities.ts:169](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L169)
