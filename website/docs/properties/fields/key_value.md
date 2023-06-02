---
id: key_value
title: Key/Value
---

![Field](/img/fields/KeyValue.png)

Key/Value is a special field that allows you to input arbitrary key/value pairs.
You are able to use string as keys and any primitive type as value (including maps
and arrays).


```typescript jsx
import { buildProperty } from "firecms";

buildProperty({
    name: "Content",
    dataType: "array",
    oneOf: {
        typeField: "type",
        valueField: "value",
        properties: {
            images: {
                dataType: "string",
                name: "Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            text: {
                dataType: "string",
                name: "Text",
                markdown: true
            },
            products: {
                name: "Products",
                dataType: "array",
                of: {
                    dataType: "reference",
                    path: "products",
                    previewProperties: ["name", "main_image"]
                }
            }
        }
    }
});
```

The data type is [`map`](../config/map).

Internally the component used
is [`KeyValueFieldBinding`](../../api/functions/KeyValueFieldBinding).

