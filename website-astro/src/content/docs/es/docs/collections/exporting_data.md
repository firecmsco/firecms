---
title: Exportación de datos (Exporting data)
slug: es/docs/collections/exporting_data
sidebar_label: Exportación de datos
---

Todas las vistas de colección se pueden exportar de forma predeterminada e incluirán un botón para
exportar datos en formato `csv`.

Puedes desactivar la función de exportación configurando el parámetro `exportable`
en tu colección en `false`

Se exportan todas las columnas normales, pero no los campos adicionales que
configuraste en tu vista de colección, ya que puedes construirlos con cualquier
componente de React.

Si necesitas agregar campos adicionales en tu archivo de exportación, puedes crearlos
configurando una `ExportConfig` en tu prop `exportable`:

```tsx
import { ExportMappingFunction, buildCollection } from "@firecms/core";

export const sampleAdditionalExportColumn: ExportMappingFunction = {
    key: "extra",
    builder: async ({ entity }) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return "Valor adicional exportado " + entity.id;
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
