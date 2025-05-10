I'll enhance the README with more detailed documentation, configuration options, and better examples:

# FireCMS Data Export Plugin

This plugin enables exporting Firestore collections to CSV or JSON formats directly from your FireCMS interface. It adds an export button to collection views, providing a simple way to back up data or share it with others.

## Installation

```bash
npm install @firecms/data_export
# or
yarn add @firecms/data_export
```

## Features

- Export collection data to CSV or JSON formats
- Configure export permissions based on collection size or custom logic
- Integration with FireCMS analytics events
- Custom UI for unsupported export scenarios

## Basic Usage

```tsx
import React from "react";
import { FirebaseCMSApp } from "@firecms/core";
import { useExportPlugin } from "@firecms/data_export";

// Basic setup with default options
const exportPlugin = useExportPlugin();

export default function App() {
    return <FirebaseCMSApp
        name={"My Online Shop"}
        plugins={[exportPlugin]}
        authentication={myAuthenticator}
        collections={myCollections}
        firebaseConfig={firebaseConfig}
    />;
}
```

## Advanced Configuration

You can customize the export behavior with these options:

```tsx
const exportPlugin = useExportPlugin({
    // Control when exports are allowed
    exportAllowed: ({ collectionEntitiesCount, path, collection }) => {
        // Prevent export of large collections
        if (collectionEntitiesCount > 5000) return false;
        
        // Only allow export for specific collections
        return ["products", "orders"].includes(path);
    },
    
    // Custom view when export is not allowed
    notAllowedView: <div>Export is not available for this collection</div>,
    
    // Track export events
    onAnalyticsEvent: (event, params) => {
        console.log("Export event:", event, params);
    }
});
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `exportAllowed` | `(params: ExportAllowedParams) => boolean` | Function to determine if export is allowed for a collection |
| `notAllowedView` | `React.ReactNode` | Custom component to display when export is not allowed |
| `onAnalyticsEvent` | `(event: string, params?: any) => void` | Callback for tracking export events |

Where `ExportAllowedParams` includes:
- `collectionEntitiesCount`: Number of entities in the collection
- `path`: Path of the collection
- `collection`: Collection configuration object


## Additional Notes

- Exports are performed client-side and may be limited by browser capabilities for very large collections
- CSV exports maintain data types where possible but complex objects may be simplified
- JSON exports preserve the complete data structure
