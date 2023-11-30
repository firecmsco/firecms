---
id: "EntityCollectionTableControllerProps"
title: "Type alias: EntityCollectionTableControllerProps<M>"
sidebar_label: "EntityCollectionTableControllerProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityCollectionTableControllerProps**\<`M`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `collection` | [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`\> | - |
| `entitiesDisplayedFirst?` | [`Entity`](../interfaces/Entity.md)\<`M`\>[] | List of entities that will be displayed on top, no matter the ordering. This is used for reference fields selection |
| `forceFilter?` | [`FilterValues`](FilterValues.md)\<`string`\> | - |
| `fullPath` | `string` | - |
| `lastDeleteTimestamp?` | `number` | - |

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/useEntityCollectionTableController.tsx:10](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/useEntityCollectionTableController.tsx#L10)
