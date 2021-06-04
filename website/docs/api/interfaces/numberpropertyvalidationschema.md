---
id: "numberpropertyvalidationschema"
title: "Interface: NumberPropertyValidationSchema"
sidebar_label: "NumberPropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Validation rules for numbers

## Hierarchy

- [PropertyValidationSchema](propertyvalidationschema.md)

  ↳ **NumberPropertyValidationSchema**

## Properties

### integer

• `Optional` **integer**: `boolean`

#### Defined in

[models/models.ts:762](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L762)

___

### lessThan

• `Optional` **lessThan**: `number`

#### Defined in

[models/models.ts:758](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L758)

___

### max

• `Optional` **max**: `number`

#### Defined in

[models/models.ts:757](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L757)

___

### min

• `Optional` **min**: `number`

#### Defined in

[models/models.ts:756](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L756)

___

### moreThan

• `Optional` **moreThan**: `number`

#### Defined in

[models/models.ts:759](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L759)

___

### negative

• `Optional` **negative**: `boolean`

#### Defined in

[models/models.ts:761](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L761)

___

### positive

• `Optional` **positive**: `boolean`

#### Defined in

[models/models.ts:760](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L760)

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
