---
slug: de/docs/properties/fields/block
title: Block
---

![Field](/img/fields/Block.png)

Block ist ein spezielles Feld, das es Ihnen ermöglicht, Wiederholungsfelder zu erstellen, bei denen die Einträge dynamisch sind. Jeder Eintrag hat einen `type`-Selektor, der es dem Endbenutzer ermöglicht, zwischen verschiedenen Eigenschaften zu wählen.

Es ist nützlich, wenn Sie Endbenutzern die Flexibilität geben möchten, komplexe Wiederholungsstrukturen zu erstellen, wie z.B. Blog-Einträge.

```typescript jsx
import { buildProperty } from "@firecms/core";

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

Der Datentyp ist [`array`](../config/array).
