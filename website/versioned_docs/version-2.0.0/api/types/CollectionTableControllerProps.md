---
id: "CollectionTableControllerProps"
title: "Type alias: CollectionTableControllerProps<M>"
sidebar_label: "CollectionTableControllerProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **CollectionTableControllerProps**<`M`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`<`string`, `any`\> = `any` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `collection` | [`EntityCollection`](../interfaces/EntityCollection.md)<`M`\> | - |
| `entitiesDisplayedFirst?` | [`Entity`](../interfaces/Entity.md)<`M`\>[] | List of entities that will be displayed on top, no matter the ordering. This is used for reference fields selection |
| `forceFilter?` | [`FilterValues`](FilterValues.md)<`string`\> | - |
| `fullPath` | `string` | - |
| `lastDeleteTimestamp?` | `number` | - |

#### Defined in

[packages/firecms/src/core/components/EntityCollectionTable/useCollectionTableController.tsx:33](https://github.com/FireCMSco/firecms/blob/a461b0be/packages/firecms/src/core/components/EntityCollectionTable/useCollectionTableController.tsx#L33)
