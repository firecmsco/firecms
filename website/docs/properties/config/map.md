---
id: map
title: Map
sidebar_label: Map
---

In a map property you define child properties in the same way you define them
at the entity schema level:

```tsx
import { buildProperty } from "./builders";

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
            enumValues: {
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

### `expanded`
Should the map be expanded by default in the form view. Defaults to `false`.

### `keyValue`
Render this map as a key-value table that allows to use
arbitrary keys. You don't need to define the properties in this case.

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.

---

The widget that gets created is
- [`MapFieldBinding`](../../api/functions/MapFieldBinding) Field that renders the children
  property fields

Links:
- [API](../../api/interfaces/mapproperty)
