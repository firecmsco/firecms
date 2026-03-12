---
slug: de/docs/collections/exporting_data
title: Daten exportieren
sidebar_label: Daten exportieren
---

Jede Kollektionsansicht ist standardmäßig exportierbar und enthält eine Schaltfläche zum
Exportieren von Daten im `csv`-Format.

Sie können die Exportfunktion deaktivieren, indem Sie den `exportable`-Parameter
in Ihrer Kollektion auf `false` setzen.

Alle regulären Spalten werden exportiert, aber nicht die zusätzlichen Felder, die Sie
in Ihrer Kollektionsansicht eingerichtet haben, da Sie diese mit beliebigen React-
Komponenten erstellen können.

Wenn Sie zusätzliche Felder in Ihrer Exportdatei hinzufügen müssen, können Sie diese
erstellen, indem Sie eine `ExportConfig` in Ihrer `exportable`-Eigenschaft setzen:

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
