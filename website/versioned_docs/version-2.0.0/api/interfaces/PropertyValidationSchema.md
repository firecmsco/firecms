---
id: "PropertyValidationSchema"
title: "Interface: PropertyValidationSchema"
sidebar_label: "PropertyValidationSchema"
sidebar_position: 0
custom_edit_url: null
---

Rules to validate any property. Some properties have specific rules
additionally to these.

## Hierarchy

- **`PropertyValidationSchema`**

  ↳ [`NumberPropertyValidationSchema`](NumberPropertyValidationSchema.md)

  ↳ [`StringPropertyValidationSchema`](StringPropertyValidationSchema.md)

  ↳ [`DatePropertyValidationSchema`](DatePropertyValidationSchema.md)

  ↳ [`ArrayPropertyValidationSchema`](ArrayPropertyValidationSchema.md)

## Properties

### required

• `Optional` **required**: `boolean`

Is this field required

#### Defined in

[packages/firecms_core/src/types/properties.ts:622](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L622)

___

### requiredMessage

• `Optional` **requiredMessage**: `string`

Customize the required message when the property is not set

#### Defined in

[packages/firecms_core/src/types/properties.ts:627](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L627)

___

### unique

• `Optional` **unique**: `boolean`

If the unique flag is set to `true`, you can only have one entity in the
collection with this value.

#### Defined in

[packages/firecms_core/src/types/properties.ts:633](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L633)

___

### uniqueInArray

• `Optional` **uniqueInArray**: `boolean`

If the uniqueInArray flag is set to `true`, you can only have this value
once per entry in the parent `ArrayProperty`. It has no effect if this
property is not a child of an `ArrayProperty`. It works on direct
children of an `ArrayProperty` or first level children of `MapProperty`

#### Defined in

[packages/firecms_core/src/types/properties.ts:641](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L641)
