# FireCMS Collection Editor Plugin

This plugin enables creating and managing Firestore collections directly from your FireCMS interface. It adds a visual
collection editor that allows you to create, edit, and delete collections without writing code.

## Installation

```bash
npm install @firecms/collection_editor
# or
yarn add @firecms/collection_editor
```

For Firebase integration, also install:

```bash
npm install @firecms/collection_editor_firebase
# or
yarn add @firecms/collection_editor_firebase
```

## Features

- Create and edit collections through a visual interface
- Define properties, validations, and display options
- Organize collections with groups and subcollections
- Merge UI-defined collections with code-defined collections
- Persist collection configurations in Firestore
- Control permissions for collection editing operations

## Basic Usage

```tsx
import React from "react";
import { FireCMS } from "@firecms/core";
import { useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";

export default function App() {
    // Controller to save collection configs in Firestore
    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });
    
    // Initialize the collection editor plugin
    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
    });
    
    const navigationController = useBuildNavigationController({
        // Your other config options
        plugins: [collectionEditorPlugin]
    });
    
    return <FireCMS
        name={"My CMS"}
        navigationController={navigationController}
        authentication={myAuthenticator}
        firebaseConfig={firebaseConfig}
    />;
}
```

## Advanced Configuration

You can customize collection editor behavior with these options:

```tsx
const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController, // Required: controller that handles persistence
    
    // Define permissions for collection operations
    configPermissions: ({ user }) => ({
        createCollections: user.roles?.includes("admin") ?? false,
        editCollections: user.roles?.includes("admin") ?? false,
        deleteCollections: user.roles?.includes("admin") ?? false
    }),
    
    // Prevent these group names from being used
    reservedGroups: ["admin", "system"],
    
    // Optional custom view to add to the editor
    extraView: {
        View: MyCustomView,
        icon: <CustomIcon />
    },
    
    // Function to infer collection structure from existing data
    collectionInference: async ({ path }) => {
        // Return inferred schema based on data at path
    },
    
    // Function to get sample data for a collection
    getData: async (path, parentPaths) => {
        // Return sample data for the specified path
    },
    
    // Track collection editor events
    onAnalyticsEvent: (event, params) => {
        console.log("Collection editor event:", event, params);
    },
    
    // Include introduction widget when no collections exist
    includeIntroView: true
});
```

## Integration with Code-Defined Collections

You can combine collections defined in code with those created in the UI:

```tsx
import { mergeCollections } from "@firecms/collection_editor";

const collectionsBuilder = useCallback(() => {
    // Collections defined in code
    const codeCollections = [productsCollection, ordersCollection];
    
    // Merge with collections from the editor UI
    return mergeCollections(codeCollections, collectionConfigController.collections ?? []);
}, [collectionConfigController.collections]);

const navigationController = useBuildNavigationController({
    collections: collectionsBuilder,
    // Other options
});
```

## Firestore Configuration Controller

To persist collections in Firestore:

```tsx
const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp,
    
    // Optional: specify where to save configs (default: "__FIRECMS/config/collections")
    configPath: "custom/config/path",
    
    // Optional: define permissions for collections
    permissions: ({ user }) => ({
        // Your permissions logic
    }),
    
    // Optional: custom property configurations
    propertyConfigs: [
        // Custom property types
    ]
});
```

## Additional Notes

- Collections created through the editor are stored in Firestore and loaded dynamically
- The plugin automatically adds UI elements for creating and managing collections
- For a complete solution, consider using alongside other plugins like data import/export

## Related Plugins

FireCMS offers several complementary plugins:

- Data Import: Import data from CSV or JSON into Firestore collections
- Data Export: Export collection data to CSV or JSON formats
- Data Enhancement: Generate content using AI for your collections
- Entity History: Track changes to your collection entities
