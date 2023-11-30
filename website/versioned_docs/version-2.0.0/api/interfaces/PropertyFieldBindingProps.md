---
id: "PropertyFieldBindingProps"
title: "Interface: PropertyFieldBindingProps<T, M>"
sidebar_label: "PropertyFieldBindingProps"
sidebar_position: 0
custom_edit_url: null
---

In case you need to render a field bound to a Property inside your
custom field you can use [PropertyFieldBinding](../functions/PropertyFieldBinding.md) with these props.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType.md) |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

## Properties

### autoFocus

• `Optional` **autoFocus**: `boolean`

Should the field take focus when rendered. When opening the popup view
in table mode, it makes sense to put the focus on the only field rendered.

#### Defined in

[packages/firecms_core/src/types/fields.tsx:214](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L214)

___

### context

• **context**: [`FormContext`](FormContext.md)\<`M`\>

The context where this field is being rendered. You get a context as a
prop when creating a custom field.

#### Defined in

[packages/firecms_core/src/types/fields.tsx:182](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L182)

___

### disabled

• `Optional` **disabled**: `boolean`

Should this field be disabled

#### Defined in

[packages/firecms_core/src/types/fields.tsx:219](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L219)

___

### includeDescription

• `Optional` **includeDescription**: `boolean`

Should the description be included in this field

#### Defined in

[packages/firecms_core/src/types/fields.tsx:187](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L187)

___

### partOfArray

• `Optional` **partOfArray**: `boolean`

Is this field part of an array

#### Defined in

[packages/firecms_core/src/types/fields.tsx:203](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L203)

___

### partOfBlock

• `Optional` **partOfBlock**: `boolean`

Is this field part of a block (oneOf array)

#### Defined in

[packages/firecms_core/src/types/fields.tsx:208](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L208)

___

### property

• **property**: [`PropertyOrBuilder`](../types/PropertyOrBuilder.md)\<`T`\> \| [`ResolvedProperty`](../types/ResolvedProperty.md)\<`T`\>

The CMS property you are binding this field to

#### Defined in

[packages/firecms_core/src/types/fields.tsx:176](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L176)

___

### propertyKey

• **propertyKey**: `string`

The key/path of the property, such as `age`. You can use nested and array
indexed such as `address.street` or `people[3]`

#### Defined in

[packages/firecms_core/src/types/fields.tsx:171](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L171)

___

### tableMode

• `Optional` **tableMode**: `boolean`

Is this field being rendered in a table

#### Defined in

[packages/firecms_core/src/types/fields.tsx:198](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L198)

___

### underlyingValueHasChanged

• `Optional` **underlyingValueHasChanged**: `boolean`

Has the value of this property been updated in the database while this
field is being edited

#### Defined in

[packages/firecms_core/src/types/fields.tsx:193](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/fields.tsx#L193)
