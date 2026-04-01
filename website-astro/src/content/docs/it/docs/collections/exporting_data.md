---
title: Esportazione dati
slug: it/docs/collections/exporting_data
sidebar_label: Esportazione dati
---

Ogni vista collezione è esportabile per impostazione predefinita e includerà un pulsante per esportare i dati in formato `csv`.

Puoi disattivare la funzione di esportazione impostando il parametro `exportable` nella tua collezione su `false`.

Tutte le colonne regolari vengono esportate, ma non i campi aggiuntivi che hai impostato nella tua vista collezione, poiché puoi costruirli con qualsiasi componente React.

Se hai bisogno di aggiungere campi aggiuntivi nel tuo file di esportazione, puoi crearli impostando un `ExportConfig` nella tua prop `exportable`:

```tsx
import { ExportMappingFunction, buildCollection } from "@firecms/core";

export const sampleAdditionalExportColumn: ExportMappingFunction = {
    key: "extra",
    builder: async ({ entity }) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return "Additional exported value " + entity.id;
    }
};

const blogCollection = buildCollection({
    path: "blog",
    collection: blogCollection,
    name: "Blog",
    exportable: {
        additionalFields: [sampleAdditionalExportColumn]
    },
});
```
