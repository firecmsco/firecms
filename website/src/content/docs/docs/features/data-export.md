---
title: Data Export
sidebar_label: Data Export
slug: docs/features/data-export
description: Export collection data to CSV and JSON formats.
---

## Overview

Export data from any collection to CSV or JSON format.

## How to Export

1. Open a collection
2. Click the **Export** button in the toolbar
3. Choose format (CSV or JSON)
4. Optionally filter before exporting to export a subset

## Configuration

```typescript
const productsCollection: EntityCollection = {
    slug: "products",
    exportable: true,            // Enable (default: true)
    // Or with config:
    exportable: {
        additionalFields: [
            {
                key: "computed_margin",
                title: "Margin",
                builder: ({ entity }) => {
                    return entity.values.price - entity.values.cost;
                }
            }
        ]
    },
    properties: { /* ... */ }
};
```

## Next Steps

- **[Data Import](/docs/features/data-import)** — Import data from files
