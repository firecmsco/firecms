# Rebase Data Import Plugin

This plugin enables importing data into Firestore collections directly from your Rebase interface. It adds an import button to collection views, providing a simple way to bulk add or update data from CSV or JSON files.

## Installation

```bash
npm install @rebasepro/data_import
# or
yarn add @rebasepro/data_import
```

## Features

- Import data from CSV or JSON formats into Firestore collections
- Validate data before importing to ensure integrity
- Integration with Rebase analytics events
- Support for bulk data creation and updates

## Basic Usage

```tsx
import React from "react";
import { Rebase } from "@rebasepro/core";
import { useImportPlugin } from "@rebasepro/data_import";


export default function App() {

    // Basic setup with default options
    const importPlugin = useImportPlugin();

    return <Rebase
        name={"My Online Shop"}
        plugins={[importPlugin]}
        authentication={myAuthenticator}
        collections={myCollections}
        firebaseConfig={firebaseConfig}
    />;
}
```

## Advanced Configuration

You can customize the import behavior with these options:

```tsx
const importPlugin = useImportPlugin({
    // Track import events
    onAnalyticsEvent: (event, params) => {
        console.log("Import event:", event, params);
        // Example events: "import_started", "import_completed", "import_error"
    }
});
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `onAnalyticsEvent` | `(event: string, params?: any) => void` | Callback for tracking import events |

## Integration with Export

For a complete data management solution, use both import and export plugins together:

```tsx
import { useImportPlugin } from "@rebasepro/data_import";
import { useExportPlugin } from "@rebasepro/data_export";

// Set up both plugins
const importPlugin = useImportPlugin();
const exportPlugin = useExportPlugin();

// Add both to your Rebase app
return (
    <Rebase
        // ...other props
        plugins={[importPlugin, exportPlugin]}
    >
        {/* ... */}
    </Rebase>
);
```

## Additional Notes

- The import functionality validates data against your collection schema before importing
- Complex data types (maps, arrays, references) are supported when importing from JSON
- When importing from CSV, type conversion is performed according to your schema
- Large imports are processed in batches to avoid Firestore limitations
