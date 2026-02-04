---
slug: docs/properties/config/map
title: Map
sidebar_label: Map
description: Configuration for map properties (nested objects) in FireCMS, including child properties, previews, and key-value mode.
---

In a map property you define child properties in the same way you define them
at the entity schema level:

```tsx
import { buildProperty } from "@firecms/core";

const ctaProperty = buildProperty({
    dataType: "map",
    properties: {
        name: {
            name: "Name",
            description: "Text that will be shown on the button",
            validation: { required: true },
            dataType: "string"
        },
        type: {
            name: "Type",
            description: "Action type that determines the user flow",
            validation: { required: true, uniqueInArray: true },
            dataType: "string",
            enum: {
                complete: "Complete",
                continue: "Continue"
            }
        }
    }
});
```

###  `properties`
Record of properties included in this map.

### `previewProperties`
List of properties rendered as this map preview. Defaults to first 3.

### `spreadChildren`
Display the child properties as independent columns in the collection
view. Defaults to `false`.

### `pickOnlySomeKeys`

Allow the user to add only some keys in this map.
By default, all properties of the map have the corresponding field in
the form view. Setting this flag to true allows to pick only some.
Useful for map that can have a lot of sub-properties that may not be
needed.

### `expanded`

Determines whether the field should be initially expanded. Defaults to `true`.

### `keyValue`

Render this map as a key-value table that allows to use
arbitrary keys. You don't need to define the properties in this case.

### `minimalistView`

When set to `true`, displays the child properties directly without being wrapped in an extendable panel.

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.

---

The widget that gets created is
- [`MapFieldBinding`](../../api/functions/MapFieldBinding) Field that renders the children
  property fields

Links:
- [API](../../api/interfaces/MapProperty)
