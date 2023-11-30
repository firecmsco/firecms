---
id: "PropertyBuilder"
title: "Type alias: PropertyBuilder<T, M>"
sidebar_label: "PropertyBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyBuilder**\<`T`, `M`\>: (`{
         values,
         previousValues,
         propertyValue,
         path,
         entityId
     }`: [`PropertyBuilderProps`](PropertyBuilderProps.md)\<`M`\>) => [`Property`](Property.md)\<`T`\> \| ``null``

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](CMSType.md) = `any` |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Type declaration

▸ (`{
         values,
         previousValues,
         propertyValue,
         path,
         entityId
     }`): [`Property`](Property.md)\<`T`\> \| ``null``

You can use this type to define a property dynamically, based
on the current values of the entity, the previous values and the
current value of the property, as well as the path and entity ID.

##### Parameters

| Name | Type |
| :------ | :------ |
| `{
         values,
         previousValues,
         propertyValue,
         path,
         entityId
     }` | [`PropertyBuilderProps`](PropertyBuilderProps.md)\<`M`\> |

##### Returns

[`Property`](Property.md)\<`T`\> \| ``null``

#### Defined in

[packages/firecms_core/src/types/properties.ts:274](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L274)
