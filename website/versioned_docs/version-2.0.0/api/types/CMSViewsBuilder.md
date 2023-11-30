---
id: "CMSViewsBuilder"
title: "Type alias: CMSViewsBuilder"
sidebar_label: "CMSViewsBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **CMSViewsBuilder**: (`params`: \{ `authController`: [`AuthController`](AuthController.md) ; `dataSource`: [`DataSource`](../interfaces/DataSource.md) ; `user`: [`User`](User.md) \| ``null``  }) => [`CMSView`](../interfaces/CMSView.md)[] \| `Promise`\<[`CMSView`](../interfaces/CMSView.md)[]\>

#### Type declaration

▸ (`params`): [`CMSView`](../interfaces/CMSView.md)[] \| `Promise`\<[`CMSView`](../interfaces/CMSView.md)[]\>

Use this callback to build custom views dynamically.
You can use the user to decide which views to show.
You can also use the data source to fetch additional data to build the
views. Note: you can use any type of synchronous or asynchronous code here,
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

[`CMSView`](../interfaces/CMSView.md)[] \| `Promise`\<[`CMSView`](../interfaces/CMSView.md)[]\>

#### Defined in

[packages/firecms_core/src/types/firecms.tsx:41](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/firecms.tsx#L41)
