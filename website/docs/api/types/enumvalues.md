---
id: "enumvalues"
title: "Type alias: EnumValues"
sidebar_label: "EnumValues"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EnumValues**: `Record`<string \| number, string \| [EnumValueConfig](enumvalueconfig.md)\> \| `Map`<string, string \| [EnumValueConfig](enumvalueconfig.md)\>

We use this type to define mapping between string or number values in
Firestore to a label (such in a select dropdown).
The key in this Record is the value saved in Firestore, and the value in
this record is the label displayed in the UI.
You can add additional customization by assigning a `EnumValueConfig` for the
label instead of a simple string (for enabling or disabling options and
choosing colors).
If you need to ensure the order of the elements you can pass a `Map` instead
of a plain object.

#### Defined in

[models/properties.ts:128](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L128)
