---
id: group
title: Group
---

![Field](/img/fields/Group.png)

Use this field to group other groups into a single one, represented by an
expandable panel. This is useful for bundling together data into logical fields,
both from the UX and the data model perspective.

Group fields can be initially expanded or collapsed by default.

```typescript jsx
import { buildProperty } from "@firecms/cloud";

buildProperty({
    name: "Address",
    dataType: "map",
    properties: {
        street: {
            name: "Street",
            dataType: "string"
        },
        postal_code: {
            name: "Postal code",
            dataType: "number"
        }
    },
    expanded: true
});
```

The data type is [`map`](../config/map).

Internally the component used
is [`MapFieldBinding`](../../api/functions/MapFieldBinding).

