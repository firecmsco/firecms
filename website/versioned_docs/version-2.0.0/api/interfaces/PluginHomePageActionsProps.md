---
id: "PluginHomePageActionsProps"
title: "Interface: PluginHomePageActionsProps<EP, M, UserType, EC>"
sidebar_label: "PluginHomePageActionsProps"
sidebar_position: 0
custom_edit_url: null
---

Props passed to the FireCMSPlugin.homePage.CollectionActions method.
You can use it to add custom actions to the navigation card of each collection.

## Type parameters

| Name | Type |
| :------ | :------ |
| `EP` | extends `object` = `object` |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |
| `EC` | extends [`EntityCollection`](EntityCollection.md)\<`M`\> = [`EntityCollection`](EntityCollection.md)\<`M`\> |

## Properties

### collection

• **collection**: `EC`

The collection configuration

#### Defined in

[packages/firecms_core/src/types/plugins.tsx:149](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/plugins.tsx#L149)

___

### context

• **context**: [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`\>

Context of the app status

#### Defined in

[packages/firecms_core/src/types/plugins.tsx:154](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/plugins.tsx#L154)

___

### extraProps

• `Optional` **extraProps**: `EP`

#### Defined in

[packages/firecms_core/src/types/plugins.tsx:156](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/plugins.tsx#L156)

___

### path

• **path**: `string`

Collection path of this entity. This is the full path, like
`users/1234/addresses`

#### Defined in

[packages/firecms_core/src/types/plugins.tsx:144](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/plugins.tsx#L144)
