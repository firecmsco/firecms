---
id: "EntityCollectionsBuilder"
title: "Type alias: EntityCollectionsBuilder"
sidebar_label: "EntityCollectionsBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityCollectionsBuilder**: (`params`: \{ `authController`: [`AuthController`](AuthController.md) ; `dataSource`: [`DataSource`](../interfaces/DataSource.md) ; `user`: [`User`](User.md) \| ``null``  }) => [`EntityCollection`](../interfaces/EntityCollection.md)[] \| `Promise`\<[`EntityCollection`](../interfaces/EntityCollection.md)[]\>

#### Type declaration

▸ (`params`): [`EntityCollection`](../interfaces/EntityCollection.md)[] \| `Promise`\<[`EntityCollection`](../interfaces/EntityCollection.md)[]\>

Use this callback to build entity collections dynamically.
You can use the user to decide which collections to show.
You can also use the data source to fetch additional data to build the
collections.
Note: you can use any type of synchronous or asynchronous code here,
including fetching data from external sources, like using the Firestore
APIs directly, or a REST API.

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.authController` | [`AuthController`](AuthController.md) |
| `params.dataSource` | [`DataSource`](../interfaces/DataSource.md) |
| `params.user` | [`User`](User.md) \| ``null`` |

##### Returns

[`EntityCollection`](../interfaces/EntityCollection.md)[] \| `Promise`\<[`EntityCollection`](../interfaces/EntityCollection.md)[]\>

#### Defined in

[packages/firecms_core/src/types/firecms.tsx:26](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/firecms.tsx#L26)
