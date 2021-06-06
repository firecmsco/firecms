---
id: "propertyvalidationschema"
title: "Interface: PropertyValidationSchema"
sidebar_label: "PropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Rules to validate any property. Some properties have specific rules
on top of these.

## Hierarchy

- **PropertyValidationSchema**

  ↳ [NumberPropertyValidationSchema](numberpropertyvalidationschema.md)

  ↳ [StringPropertyValidationSchema](stringpropertyvalidationschema.md)

  ↳ [TimestampPropertyValidationSchema](timestamppropertyvalidationschema.md)

  ↳ [ArrayPropertyValidationSchema](arraypropertyvalidationschema.md)

## Properties

### required

• `Optional` **required**: `boolean`

Is this field required

#### Defined in

[models/models.ts:730](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L730)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Defined in

[models/models.ts:735](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L735)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Defined in

[models/models.ts:741](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L741)

___

### uniqueInArray

• `Optional` **uniqueInArray**: `boolean`

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Defined in

[models/models.ts:749](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L749)
