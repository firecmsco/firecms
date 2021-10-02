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
            title: "Name",
            description: "Text that will be shown on the button",
            validation: { required: true },
            dataType: "string"
        },
        type: {
            title: "Type",
            description: "Action type that determines the user flow",
            validation: { required: true, uniqueInArray: true },
            dataType: "string",
            config: {
                enumValues: {
                    complete: "Complete",
                    continue: "Continue"
                }
            }
        }
    }
});
```

##  `properties`
Record of properties included in this map.

## `previewProperties`
List of properties rendered as this map preview. Defaults to first 3.

## `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.

---

The widget that gets created is
- [`MapField`](api/functions/mapfield.md) Field that renders the children
property fields

Links:
- [API](api/interfaces/mapproperty.md)
