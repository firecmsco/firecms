---
id: exporting_data
title: Exporting data
sidebar_label: Exporting data
---

Every collection view is exportable by default and will include a button for
exporting data in `csv` format.

You can switch off the exporting function by setting the `exportable` parameter
in your collection to `false`

All the regular columns are exported, but not the additional columns that you
set up in your collection view, since you can build them with any React
component.

If you need to add additional columns in your export file, you can create
them by setting an `ExportConfig` in your `exportable` prop:

```tsx
import { ExportMappingFunction, buildCollection } from "@camberi/firecms";

export const sampleAdditionalExportColumn: ExportMappingFunction = {
    key: "extra",
    builder: async ({ entity }) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return "Additional exported value " + entity.id;
    }
};

const blogCollection = buildCollection({
    path: "blog",
    collection: blogSchema,
    name: "Blog",
    exportable: {
        additionalColumns: [sampleAdditionalExportColumn]
    },
});
```
