---
id: "SelectionController"
title: "Type alias: SelectionController<M>"
sidebar_label: "SelectionController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SelectionController**\<`M`\>: `Object`

Use this controller to retrieve the selected entities or modify them in
an [EntityCollection](../interfaces/EntityCollection.md)
If you want to pass a `SelectionController` to

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isEntitySelected` | (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `boolean` |
| `selectedEntities` | [`Entity`](../interfaces/Entity.md)\<`M`\>[] |
| `setSelectedEntities` | `Dispatch`\<`SetStateAction`\<[`Entity`](../interfaces/Entity.md)\<`M`\>[]\>\> |
| `toggleEntitySelection` | (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `void` |

#### Defined in

[packages/firecms_core/src/types/collections.ts:332](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L332)
