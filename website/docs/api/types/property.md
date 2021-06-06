---
id: "property"
title: "Type alias: Property<T, ArrayT>"
sidebar_label: "Property"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **Property**<T, ArrayT\>: `T` extends `string` ? [StringProperty](../interfaces/stringproperty.md) : `T` extends `number` ? [NumberProperty](../interfaces/numberproperty.md) : `T` extends `boolean` ? [BooleanProperty](../interfaces/booleanproperty.md) : `T` extends `Date` ? [TimestampProperty](../interfaces/timestampproperty.md) : `T` extends `firebase.firestore.Timestamp` ? [TimestampProperty](../interfaces/timestampproperty.md) : `T` extends `firebase.firestore.GeoPoint` ? [GeopointProperty](../interfaces/geopointproperty.md) : `T` extends `firebase.firestore.DocumentReference` ? [ReferenceProperty](../interfaces/referenceproperty.md) : `T` extends `ArrayT`[] ? [ArrayProperty](../interfaces/arrayproperty.md)<ArrayT\> : `T` extends `object` ? [MapProperty](../interfaces/mapproperty.md)<T\> : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` = `any` |
| `ArrayT` | `ArrayT` = `any` |

#### Defined in

[models/models.ts:375](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L375)
