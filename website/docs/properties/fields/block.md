---
id: block
title: Block
---

![Field](/img/fields/Block.png)

Block is a special field that allows you to build repeat fields where the
entries are dynamic. Each entry has a `type` selector that allows the end user
to chose among different properties.

It is useful when you want to give the flexibility of building complex
repeat structures to end users, such as blog entries.

This fields allows reordering of its entries.

This component can be expanded or collapsed by default.

```typescript jsx
import { buildProperty } from "@firecms/cloud";

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

The data type is [`array`](../config/array).

Internally the component used
is [`BlockFieldBinding`](../../api/functions/BlockFieldBinding).

