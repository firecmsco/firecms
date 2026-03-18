---
title: Block
slug: it/docs/properties/fields/block
---

![Field](/img/fields/Block.png)

Block è un campo speciale che ti permette di costruire campi ripetuti dove le
voci sono dinamiche. Ogni voce ha un selettore `type` che consente all'utente finale
di scegliere tra proprietà diverse.

È utile quando vuoi dare agli utenti finali la flessibilità di costruire strutture
ripetute complesse, come voci di blog.

Questo campo permette il riordino delle voci.

Questo componente può essere espanso o compresso per default.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Contenuto",
    dataType: "array",
    oneOf: {
        typeField: "type",
        valueField: "value",
        properties: {
            images: {
                dataType: "string",
                name: "Immagine",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            text: {
                dataType: "string",
                name: "Testo",
                markdown: true
            },
            products: {
                name: "Prodotti",
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

Il tipo di dato è [`array`](../config/array).

Il componente utilizzato internamente
è [`BlockFieldBinding`](../../api/functions/BlockFieldBinding).
