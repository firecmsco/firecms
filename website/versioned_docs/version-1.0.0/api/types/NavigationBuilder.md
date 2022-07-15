---
id: "NavigationBuilder"
title: "Type alias: NavigationBuilder<UserType>"
sidebar_label: "NavigationBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **NavigationBuilder**<`UserType`\>: (`props`: [`NavigationBuilderProps`](../interfaces/NavigationBuilderProps)<`UserType`\>) => `Promise`<[`Navigation`](../interfaces/Navigation)\> \| (`props`: [`NavigationBuilderProps`](../interfaces/NavigationBuilderProps)<`UserType`\>) => [`Navigation`](../interfaces/Navigation)

You can use this builder to customize the navigation, based on the logged in
user

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](User) = [`User`](User) |

#### Defined in

[models/navigation.ts:15](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L15)
