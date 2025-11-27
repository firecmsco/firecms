---
slug: docs/pro/data_import
title: Data Import
---

![data_import.png](/img/data_import.png)

The **Data Import Plugin** for FireCMS enables you to import collection data from JSON, CSV, XLSL (Excel) files directly
into your
FireCMS application. This plugins provide an interface where users can upload files and map the existing data to the
collection properties. This makes it very convenient to move data from one service to another and convert data into
the right data types in the database.

The plugin is able to do automatic conversion of some data types such as dates.

The import feature can be also used within the collection editor plugin. In the collection editor, you can create
new collections from a data file. It will be able to understand your data structure correctly, and even infer
types such as as dates or enums (even if they are stored as strings).

## Installation

First, install the Data Import Plugin package:

```sh
yarn add @firecms/data_import
```

## Configuration

Integrate the Data Import Plugin using the `useImportPlugin` hook. You can optionally provide `ImportPluginProps` to
customize its behavior.

### ImportPluginProps

- **`onAnalyticsEvent`**: A callback triggered on import-related analytics events.
    - **Type**: `(event: string, params?: any) => void`
    - **Default**: `undefined`

## Hook Usage

Use the `useImportPlugin` hook to create the import plugin and include it in the FireCMS configuration.

### Example: Integrating the Data Import Plugin

```jsx
import React from "react";
import { CircularProgressCenter, FireCMS, useBuildModeController } from "@firecms/core";
import { useFirebaseStorageSource } from "@firecms/firebase";
import { useImportPlugin } from "@firecms/data_import";

export function App() {

    const importPlugin = useImportPlugin({
        onAnalyticsEvent: (event, params) => {
            console.log(`Import Event: ${event}`, params);
            // Integrate with your analytics service if needed
        },
    });


    return (
            <FireCMS
                navigationController={navigationController}
                /*... rest of your configuration */
            >
              {({ context, loading }) => {
                  // ... your components
              }}
            </FireCMS>
    );
}

export default App;
```

## Using the Import Functionality

After integration, the import feature is available within your collection views. Users can upload JSON or CSV files to
populate the collections.

### Steps to Import Data

1. **Navigate to a Collection**: Open the desired collection in your FireCMS application.
2. **Initiate Import**: Click on the **Import** action in the collection actions toolbar.
3. **Upload File**: Select and upload the JSON or CSV file containing the data.
4. **Data Type Mapping**: Select the data types and how your data should be mapped to the current structure.
4. **Data Processing**: The plugin processes the file and adds the data to your collection.

## Types

### `ImportPluginProps`

Defines the properties for the `useImportPlugin` hook.

```typescript
export type ImportPluginProps = {
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ImportAllowedParams`

Provides context for determining import permissions.

```typescript
export type ImportAllowedParams = { 
    collectionEntitiesCount: number; 
    path: string; 
    collection: EntityCollection; 
};
```

## Example: Tracking Imports with Google Analytics

```jsx
const importPlugin = useImportPlugin({
    onAnalyticsEvent: (event, params) => {
        if (window && window.gtag) {
            window.gtag('event', event, params);
        }
    },
});
```

