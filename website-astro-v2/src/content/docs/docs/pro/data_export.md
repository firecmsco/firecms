---
slug: docs/data_export
title: Data Export
---

![data_export.png](/img/data_export.png)


This document provides an overview of how to use the **Data Export Plugin** with FireCMS to export collection data in
JSON or CSV formats.

The Data Export Plugin allows you to export data from your FireCMS collections easily. With this plugin, you can
generate JSON or CSV files containing your collection data, which can be useful for data backups, migrations, or offline
analysis.

In this document, we will cover how to set up and use this plugin in your FireCMS application.

## Installation

First, ensure you have installed the necessary dependencies. To use the plugin, you need to have FireCMS set up in your
project.

```sh
yarn add @firecms/data_export
```

or

```sh
npm install @firecms/data_export
```

## Configuration

The plugin requires minimal configuration and can be easily integrated into your FireCMS setup. You can customize the
export behavior using the `ExportPluginProps`.

### ExportPluginProps Parameters

Below are the parameters you can configure:

- **`exportAllowed`**: A function that determines whether exporting is allowed based on the provided parameters.
    - **Type**: `(props: ExportAllowedParams) => boolean`
    - **Default**: `undefined` (exporting is allowed by default)
- **`notAllowedView`**: A React node to display when exporting is not permitted.
    - **Type**: `React.ReactNode`
    - **Default**: `undefined`
- **`onAnalyticsEvent`**: A callback function triggered on analytics events related to exporting.
    - **Type**: `(event: string, params?: any) => void`
    - **Default**: `undefined`

### ExportAllowedParams

The `ExportAllowedParams` type provides context for the `exportAllowed` function:

- **`collectionEntitiesCount`**: The number of entities in the collection.
    - **Type**: `number`
- **`path`**: The path of the collection in FireCMS.
    - **Type**: `string`
- **`collection`**: The collection entity.
    - **Type**: `EntityCollection`

## Hook Usage

The main hook to utilize the plugin's functionality is `useExportPlugin`. Here's an example of how to use it:

```jsx
import React from "react";
import { FireCMS } from "@firecms/core";
import { useExportPlugin } from "@firecms/data_export";

function App() {
    
    const exportPlugin = useExportPlugin({
        exportAllowed: ({
                            collectionEntitiesCount,
                            path,
                            collection
                        }) => {
            // Example: Allow export only if there are more than 10 entities
            return collectionEntitiesCount > 10;
        },
        notAllowedView: <div>Exporting is not permitted.</div>,
        onAnalyticsEvent: (event, params) => {
            console.log(`Export Event: ${event}`, params);
        },
    });

    const plugins = [exportPlugin];

    const navigationController = useBuildNavigationController({
        // ... rest of your config
        plugins
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

## Setting up the Plugin

To integrate the Data Export Plugin into FireCMS, use the `useExportPlugin` hook and pass the resulting plugin into the
FireCMS configuration. You will typically want to do this in your main App component.

## Using the Export Functionality

Once the plugin is integrated, you can use the export functionality directly within your collection views. The plugin
adds export actions to your collection views, allowing users to export data as JSON or CSV.

### Example: Exporting a Collection

1. Navigate to the desired collection in your FireCMS application.
2. Click on the **Export** action in the collection actions toolbar.
3. Choose the desired export format (JSON or CSV).
4. The exported file will be downloaded to your device.

## Customizing the Export Behavior

You can customize how the export functionality behaves by providing custom implementations for the `exportAllowed`,
`notAllowedView`, and `onAnalyticsEvent` props.

### Example: Restricting Export Based on User Role

```jsx
const exportPlugin = useExportPlugin({
    exportAllowed: ({
                        collection,
                        path,
                        collectionEntitiesCount
                    }) => {
        // Allow export only for admins
        return userRoles.includes('admin');
    },
    notAllowedView: <div>Only administrators can export data.</div>,
    onAnalyticsEvent: (event, params) => {
        // Log export events for auditing
        logAnalytics(event, params);
    },
});
```

## Types

### `ExportPluginProps`

Defines the properties that can be passed to the `useExportPlugin` hook.

```typescript
export type ExportPluginProps = {
    exportAllowed?: (props: ExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ExportAllowedParams`

Provides context to determine if exporting is allowed.

```typescript
export type ExportAllowedParams = {
    collectionEntitiesCount: number;
    path: string;
    collection: EntityCollection;
};
```

