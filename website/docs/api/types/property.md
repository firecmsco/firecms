---
id: "property"
title: "Type alias: Property<T>"
sidebar_label: "Property"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **Property**<T\>: `T` extends `string` ? [StringProperty](../interfaces/stringproperty.md) : `T` extends `number` ? [NumberProperty](../interfaces/numberproperty.md) : `T` extends `boolean` ? [BooleanProperty](../interfaces/booleanproperty.md) : `T` extends `Date` ? [TimestampProperty](../interfaces/timestampproperty.md) : `T` extends `firebase.firestore.Timestamp` ? [TimestampProperty](../interfaces/timestampproperty.md) : `T` extends `firebase.firestore.GeoPoint` ? [GeopointProperty](../interfaces/geopointproperty.md) : `T` extends `firebase.firestore.DocumentReference` ? [ReferenceProperty](../interfaces/referenceproperty.md) : `T` extends `any`[] ? [ArrayProperty](../interfaces/arrayproperty.md)<T\> : `T` extends `object` ? [MapProperty](../interfaces/mapproperty.md)<T\> : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](cmstype.md) = `any` |

#### Defined in

[models/properties.ts:19](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L19)
