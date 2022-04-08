---
id: "SelectionController"
title: "Type alias: SelectionController<M>"
sidebar_label: "SelectionController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SelectionController**<`M`\>: `Object`

Use this controller to retrieve the selected entities or modify them in
an [EntityCollection](../interfaces/EntityCollection)
If you want to pass a `SelectionController` to

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `selectedEntities` | [`Entity`](../interfaces/Entity)<`M`\>[] |
| `isEntitySelected` | (`entity`: [`Entity`](../interfaces/Entity)<`M`\>) => `boolean` |
| `setSelectedEntities` | (`selectedEntities`: [`Entity`](../interfaces/Entity)<`M`\>[]) => `void` |
| `toggleEntitySelection` | (`entity`: [`Entity`](../interfaces/Entity)<`M`\>) => `void` |

#### Defined in

[models/collections.ts:253](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L253)
