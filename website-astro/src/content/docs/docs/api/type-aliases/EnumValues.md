---
slug: "docs/api/type-aliases/EnumValues"
title: "EnumValues"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EnumValues

# Type Alias: EnumValues

> **EnumValues** = [`EnumValueConfig`](EnumValueConfig)[] \| `Record`\<`string` \| `number`, `string` \| [`EnumValueConfig`](EnumValueConfig)\>

Defined in: [types/properties.ts:210](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

We use this type to define mapping between string or number values in
the data source to a label (such in a select dropdown).
The key in this Record is the value saved in the datasource, and the value in
this record is the label displayed in the UI.
You can add additional customization by assigning a [EnumValueConfig](EnumValueConfig) for the
label instead of a simple string (for enabling or disabling options and
choosing colors).
If you need to ensure the order of the elements use an array of [EnumValueConfig](EnumValueConfig)
