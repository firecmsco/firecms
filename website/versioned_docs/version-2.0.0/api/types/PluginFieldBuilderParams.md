---
id: "PluginFieldBuilderParams"
title: "Type alias: PluginFieldBuilderParams<T, M>"
sidebar_label: "PluginFieldBuilderParams"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PluginFieldBuilderParams**\<`T`, `M`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](CMSType.md) = [`CMSType`](CMSType.md) |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Field` | `React.ComponentType`\<[`FieldProps`](../interfaces/FieldProps.md)\<`T`, `any`, `M`\>\> |
| `collection` | [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`\> |
| `fieldConfigId` | `string` |
| `path` | `string` |
| `plugin` | [`FireCMSPlugin`](FireCMSPlugin.md) |
| `property` | [`Property`](Property.md)\<`T`\> \| [`ResolvedProperty`](ResolvedProperty.md)\<`T`\> |
| `propertyKey` | `string` |

#### Defined in

[packages/firecms_core/src/types/plugins.tsx:170](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/plugins.tsx#L170)
