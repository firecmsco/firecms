---
id: "EntityAction"
title: "Type alias: EntityAction<M, UserType>"
sidebar_label: "EntityAction"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityAction**\<`M`, `UserType`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `object` = `any` |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `collapsed?` | `boolean` | Show this action in the menu, defaults to true |
| `icon?` | `React.ReactElement` | - |
| `includeInForm?` | `boolean` | Show this action in the form, defaults to true |
| `name` | `string` | - |
| `onClick` | (`props`: [`EntityActionClickProps`](EntityActionClickProps.md)\<`M`, `UserType`\>) => `Promise`\<`void`\> | - |

#### Defined in

[packages/firecms_core/src/types/entity_actions.tsx:8](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/entity_actions.tsx#L8)
