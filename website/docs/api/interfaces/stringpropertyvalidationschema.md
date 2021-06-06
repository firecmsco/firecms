---
id: "stringpropertyvalidationschema"
title: "Interface: StringPropertyValidationSchema"
sidebar_label: "StringPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for strings

## Hierarchy

- [PropertyValidationSchema](propertyvalidationschema.md)

  ↳ **StringPropertyValidationSchema**

## Properties

### email

• `Optional` **email**: `boolean`

#### Defined in

[models/models.ts:773](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L773)

___

### length

• `Optional` **length**: `number`

#### Defined in

[models/models.ts:769](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L769)

___

### lowercase

• `Optional` **lowercase**: `boolean`

#### Defined in

[models/models.ts:776](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L776)

___

### matches

• `Optional` **matches**: `RegExp`

#### Defined in

[models/models.ts:772](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L772)

___

### max

• `Optional` **max**: `number`

#### Defined in

[models/models.ts:771](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L771)

___

### min

• `Optional` **min**: `number`

#### Defined in

[models/models.ts:770](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L770)

___

### required

• `Optional` **required**: `boolean`

Is this field required

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[required](propertyvalidationschema.md#required)

#### Defined in

[models/models.ts:730](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L730)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[requiredMessage](propertyvalidationschema.md#requiredmessage)

#### Defined in

[models/models.ts:735](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L735)

___

### trim

• `Optional` **trim**: `boolean`

#### Defined in

[models/models.ts:775](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L775)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[unique](propertyvalidationschema.md#unique)

#### Defined in

[models/models.ts:741](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L741)

___

### uniqueInArray

• `Optional` **uniqueInArray**: `boolean`

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[uniqueInArray](propertyvalidationschema.md#uniqueinarray)

#### Defined in

[models/models.ts:749](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L749)

___

### uppercase

• `Optional` **uppercase**: `boolean`

#### Defined in

[models/models.ts:777](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L777)

___

### url

• `Optional` **url**: `boolean`

#### Defined in

[models/models.ts:774](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L774)
