---
id: "EntityActionClickProps"
title: "Type alias: EntityActionClickProps<M, UserType>"
sidebar_label: "EntityActionClickProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityActionClickProps**\<`M`, `UserType`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `object` |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `collection?` | [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`\> | - |
| `context` | [`FireCMSContext`](FireCMSContext.md)\<`UserType`\> | - |
| `entity` | [`Entity`](../interfaces/Entity.md)\<`M`\> | - |
| `fullPath?` | `string` | - |
| `highlightEntity?` | (`entity`: [`Entity`](../interfaces/Entity.md)\<`any`\>) => `void` | - |
| `onCollectionChange?` | () => `void` | - |
| `selectionController?` | [`SelectionController`](SelectionController.md) | - |
| `sideEntityController?` | [`SideEntityController`](../interfaces/SideEntityController.md) | If this actions is being called from a side dialog |
| `unhighlightEntity?` | (`entity`: [`Entity`](../interfaces/Entity.md)\<`any`\>) => `void` | - |

#### Defined in

[packages/firecms_core/src/types/entity_actions.tsx:23](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_actions.tsx#L23)
