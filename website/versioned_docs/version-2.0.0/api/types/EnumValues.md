---
id: "EnumValues"
title: "Type alias: EnumValues"
sidebar_label: "EnumValues"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EnumValues**: [`EnumValueConfig`](EnumValueConfig.md)[] \| `Record`\<`string` \| `number`, `string` \| [`EnumValueConfig`](EnumValueConfig.md)\>

We use this type to define mapping between string or number values in
the data source to a label (such in a select dropdown).
The key in this Record is the value saved in the datasource, and the value in
this record is the label displayed in the UI.
You can add additional customization by assigning a [EnumValueConfig](EnumValueConfig.md) for the
label instead of a simple string (for enabling or disabling options and
choosing colors).
If you need to ensure the order of the elements use an array of [EnumValueConfig](EnumValueConfig.md)

#### Defined in

[packages/firecms_core/src/types/properties.ts:202](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L202)
