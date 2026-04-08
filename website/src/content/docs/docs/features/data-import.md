---
title: Data Import
sidebar_label: Data Import
slug: docs/features/data-import
description: Import data from CSV, JSON, and Excel files into your collections with field mapping and validation.
---

## Overview

Rebase supports importing data from:

- **CSV** files
- **JSON** files
- **Excel** (`.xlsx`) files

The import wizard handles column mapping, data type coercion, and validation.

## How to Import

1. Open a collection in the admin panel
2. Click the **Import** button in the toolbar
3. Select or drag-drop your file
4. Map file columns to collection properties
5. Preview the data and resolve any validation errors
6. Click **Import** to save all entities

![Data import interface](/img/data_import.png)

## Configuration

Enable/disable import per collection:

```typescript
const productsCollection: EntityCollection = {
    slug: "products",
    // Import is enabled by default
    // To disable:
    // importable: false
    properties: { /* ... */ }
};
```

## Next Steps

- **[Data Export](/docs/features/data-export)** — Export data to CSV/JSON
