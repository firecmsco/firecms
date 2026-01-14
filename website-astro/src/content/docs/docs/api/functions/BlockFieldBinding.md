---
slug: "docs/api/functions/BlockFieldBinding"
title: "BlockFieldBinding"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / BlockFieldBinding

# Function: BlockFieldBinding()

> **BlockFieldBinding**\<`T`\>(`__namedParameters`): `Element`

Defined in: [form/field\_bindings/BlockFieldBinding.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/form/field_bindings/BlockFieldBinding.tsx)

If the `oneOf` property is specified, this fields render each array entry as
a `type` select and the corresponding field widget to the selected `type.

This is one of the internal components that get mapped natively inside forms
and tables to the specified properties.

## Type Parameters

### T

`T` *extends* `any`[]

## Parameters

### \_\_namedParameters

[`FieldProps`](../interfaces/FieldProps)\<`T`\>

## Returns

`Element`
