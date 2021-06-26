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

[models/properties.ts:370](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L370)

___

### length

• `Optional` **length**: `number`

#### Defined in

[models/properties.ts:366](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L366)

___

### lowercase

• `Optional` **lowercase**: `boolean`

#### Defined in

[models/properties.ts:373](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L373)

___

### matches

• `Optional` **matches**: `RegExp`

#### Defined in

[models/properties.ts:369](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L369)

___

### max

• `Optional` **max**: `number`

#### Defined in

[models/properties.ts:368](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L368)

___

### min

• `Optional` **min**: `number`

#### Defined in

[models/properties.ts:367](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L367)

___

### required

• `Optional` **required**: `boolean`

Is this field required

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[required](propertyvalidationschema.md#required)

#### Defined in

[models/properties.ts:327](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L327)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[requiredMessage](propertyvalidationschema.md#requiredmessage)

#### Defined in

[models/properties.ts:332](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L332)

___

### trim

• `Optional` **trim**: `boolean`

#### Defined in

[models/properties.ts:372](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L372)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Inherited from

[PropertyValidationSchema](propertyvalidationschema.md).[unique](propertyvalidationschema.md#unique)

#### Defined in

[models/properties.ts:338](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L338)

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

[models/properties.ts:346](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L346)

___

### uppercase

• `Optional` **uppercase**: `boolean`

#### Defined in

[models/properties.ts:374](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L374)

___

### url

• `Optional` **url**: `boolean`

#### Defined in

[models/properties.ts:371](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L371)
