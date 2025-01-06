---
id: collection_editor
title: Collection editor UI
---

This document provides an overview of how to use the **Collection Editor UI Plugin** with **FireCMS** to manage and configure your Firestore collections efficiently. The Collection Editor UI Plugin enhances your FireCMS project by offering a user-friendly interface for creating, editing, and organizing collections, complete with customizable permissions and advanced configuration options.

The Collection Editor UI Plugin allows you to seamlessly integrate collection management into your FireCMS application, providing tools to define collection structures, set permissions, and customize collection behaviors. This plugin ensures that your collections are well-organized, secure, and tailored to your application's specific needs.

In this document, we will cover how to set up and use this plugin in your FireCMS application.

## Installation

First, ensure you have installed the necessary dependencies. To use the Collection Editor UI Plugin, you need to have FireCMS and Firebase set up in your project.

```sh
yarn add @firecms/collection_editor
```

## Configuration

The plugin requires several configurations, including controllers for managing collection configurations, permissions, and custom views.

### Default Configuration

The Collection Editor UI Plugin integrates with your Firestore backend to store and manage collection configurations. By default, configurations are managed internally, but you can customize paths and behaviors as needed.

### Firestore Security Rules

Ensure that your Firestore security rules allow the plugin to read and write to the configuration paths. Below is an example of security rules that permit authenticated users to access the collection configurations:

```firestore
match /{document=**} {
  allow read: if isFireCMSUser();
  allow write: if isFireCMSUser();
}

function isFireCMSUser(){
  return exists(/databases/$(database)/documents/__FIRECMS/config/collections/$(request.auth.uid));
}
```

## Collection Configuration Plugin

The Collection Editor UI Plugin allows you to include a UI for editing collection configurations. You can choose where the configuration is stored and pass the configuration to the plugin. The plugin includes a controller that saves the configuration in your Firestore database. The default path is `__FIRECMS/config/collections`.

The controller includes a few methods you can use in your own components to manage the collection configuration.

```jsx
const collectionConfigController = useFirestoreCollectionsConfigController({
    firebaseApp
});
```

You are free to define your collections in code or use the UI to define them. You can also allow the modification in the UI of the collections defined in code. You can then merge the collections defined in code with the ones defined in the UI.

```jsx
import { useCallback } from "react";
import { mergeCollections } from "@firecms/collection_editor";
import { productsCollection } from "./collections/products_collection";


// The collection builder is passed to the navigation controller
const collectionsBuilder = useCallback(() => {
    // Here we define a sample collection in code.
    const collections = [
        productsCollection
        // Your collections here
    ];
    // You can merge collections defined in the collection editor (UI) with your own collections
    return mergeCollections(collections, collectionConfigController.collections ?? []);
}, [collectionConfigController.collections]);
```

In order to add the Collection Editor UI Plugin, you need to include it in the list of plugins passed to the `FireCMS` component.

```jsx
const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController
});
```

## Hook Usage

The main hook to utilize the plugin's functionality is `useCollectionEditorPlugin`. Here's an example of how to use it:

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"],
    getData: async (path, parentPaths) => {
        // Fetch and return data for the given path
        return fetchDataForPath(path, parentPaths);
    },
    getUser: (uid) => {
        // Retrieve and return user data based on UID
        return getUserById(uid);
    },
    onAnalyticsEvent: (event, params) => {
        // Handle analytics events
        logAnalyticsEvent(event, params);
    }
});
```

## Setting up the Plugin

To integrate the Collection Editor UI Plugin into FireCMS, use the `useCollectionEditorPlugin` hook and pass the resulting plugin into the FireCMS configuration. This is typically done in your main App component.

### Example Configuration

```jsx
import React, {useCallback} from "react";
import {FireCMS, useBuildNavigationController} from "@firecms/core";
import {mergeCollections, useCollectionEditorPlugin, } from "@firecms/collection_editor";
import {useFirestoreCollectionsConfigController} from "@firecms/collection_editor_firebase";
import {useFirebaseAuthController, useFirestoreDelegate, useInitialiseFirebase, useValidateAuthenticator} from "@firecms/firebase";
import {useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin} from "@firecms/user_management";
import {productsCollection} from "./collections/products_collection";
import {customPermissionsBuilder} from "./config/permissions";
import {CustomCollectionView} from "./views/CustomCollectionView";
import {CollectionIcon} from "./components/CollectionIcon";

function App() {
    const { firebaseApp, firebaseConfigLoading, configError } = useInitialiseFirebase({
        firebaseConfig
    });

    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    const authController = useFirebaseAuthController({
        firebaseApp,
        signInOptions: ["google.com", "password"]
    });

    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        configPermissions: customPermissionsBuilder,
        reservedGroups: ["admin"],
        extraView: {
            View: CustomCollectionView,
            icon: <CollectionIcon />
        }
    });

    const userManagement = useBuildUserManagement({
        dataSourceDelegate: firestoreDelegate,
        authController: authController
    });

    const userManagementPlugin = useUserManagementPlugin({ userManagement });

    const collectionsBuilder = useCallback(() => {
        // Define your own collections
        const collections = [
            productsCollection,
            // Add other collections here
        ];
        // Merge with collections defined via the Collection Editor UI
        return mergeCollections(collections, collectionConfigController.collections ?? []);
    }, [collectionConfigController.collections]);

    const navigationController = useBuildNavigationController({
        collections: collectionsBuilder(),
        views: customViews,
        adminViews: userManagementAdminViews,
        collectionPermissions: collectionEditorPlugin.collectionPermissions,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        disabled: collectionEditorPlugin.loading,
        authController: authController,
        authenticator: customAuthenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    if (firebaseConfigLoading) {
        return <LoadingIndicator />;
    }

    if (configError) {
        return <ErrorDisplay error={configError} />;
    }

    return (
        <FireCMS
            navigationController={navigationController}
            authController={authController}
            dataSourceDelegate={firestoreDelegate}
            plugins={[userManagementPlugin, collectionEditorPlugin]}
        >
            {({ context, loading }) => {
                if (loading || authLoading) {
                    return <LoadingSpinner />;
                }
                if (!canAccessMainView) {
                    return <AccessDenied message={notAllowedError} />;
                }
                return <MainAppLayout />;
            }}
        </FireCMS>
    );
}

export default App;
```

## Adding the Collection Editor Views

The Collection Editor UI Plugin provides custom views that you need to add to your FireCMS project. These views are integrated into the FireCMS navigation and allow users to manage collections effectively.

### Example Integration

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"],
    extraView: {
        View: CustomCollectionView,
        icon: <CollectionIcon />
    }
});

// Then, include the plugin in your FireCMS configuration
<FireCMS
    navigationController={navigationController}
    authController={authController}
    dataSourceDelegate={firestoreDelegate}
    plugins={[userManagementPlugin, collectionEditorPlugin]}
>
    {/* Your application components */}
</FireCMS>
```

## Authenticating Users

The Collection Editor UI Plugin integrates with your authentication system to ensure that only authorized users can manage collections. You can use the `useValidateAuthenticator` hook to authenticate users and determine their access levels.

### Example Usage

```jsx
import { useValidateAuthenticator } from "@firecms/core";

const {
    authLoading,
    canAccessMainView,
    notAllowedError
} = useValidateAuthenticator({
    disabled: collectionEditorPlugin.loading,
    authController: authController,
    authenticator: customAuthenticator,
    dataSourceDelegate: firestoreDelegate,
    storageSource: storageSource
});

if (authLoading) {
    return <LoadingIndicator />;
}

if (!canAccessMainView) {
    return <AccessDeniedError message={notAllowedError} />;
}

// Render your main application view
```

## Integrating Collection Permissions

The Collection Editor UI Plugin includes a `collectionPermissions` function that determines what operations a user can perform based on their roles and the collection configuration. This function ensures that users have appropriate access rights throughout your FireCMS project.

### Example Integration

```jsx
const navigationController = useBuildNavigationController({
    collections: customCollections,
    views: customViews,
    adminViews: userManagementAdminViews,
    collectionPermissions: collectionEditorPlugin.collectionPermissions,
    authController,
    dataSourceDelegate: firestoreDelegate
});
```

**Note:** Applying permissions to a collection overrides the permissions set in the collection configuration.

## Error Handling

The plugin provides comprehensive error handling through properties such as `configError` and `collectionErrors` in the `CollectionEditor` object. These can be used to detect and display error messages when loading or managing collections.

### Example Error Handling

```jsx
if (collectionEditorPlugin.configError) {
    return <ErrorDisplay error={collectionEditorPlugin.configError} />;
}

if (collectionEditorPlugin.collectionErrors) {
    return <ErrorDisplay error={collectionEditorPlugin.collectionErrors} />;
}
```

## Using the Plugin within Your Application

Once you have set up the Collection Editor UI Plugin, you will have access to a suite of tools and functions for managing your Firestore collections. You can access the collection management functions and data through the `useCollectionEditorPlugin` hook.

### Collection Editor Object

The `collectionEditor` object returned by the `useCollectionEditorPlugin` hook includes the following properties:

- **`loading`**: Indicates if the collection data is being loaded. Boolean value.
- **`collections`**: Array of collection objects. Contains the collections being managed.
- **`saveCollection`**: Function to persist a collection. Takes a `collection` object and returns a promise resolving with the saved collection.
- **`deleteCollection`**: Function to delete a collection. Takes a `collection` object and returns a promise resolving when the collection is deleted.
- **`configError`**: Holds any error that occurred while loading collection configurations.
- **`collectionPermissions`**: Function that defines the permissions for collections based on user roles and collection configurations.
- **`createCollection`**: Function to initiate the creation of a new collection.
- **`reservedGroups`**: Array of group names that are reserved and cannot be used in collection names.
- **`extraView`**: Custom view added to the FireCMS navigation for collection management.
- **`getPathSuggestions`**: Function to provide path suggestions during collection creation.
- **`defineRolesFor`**: Function to define roles for a given user, typically integrated into your auth controller.
- **`authenticator`**: Optional. Authenticator callback built from the current configuration of the collection editor. It will only allow access to users with the required roles.

### Example Access

```jsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";

const collectionEditor = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"]
});

// Use collectionEditor properties and functions
if (collectionEditor.loading) {
    return <LoadingIndicator />;
}

return (
    <div>
        {collectionEditor.collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection} />
        ))}
        <Button onClick={() => collectionEditor.createCollection()}>
            Create New Collection
        </Button>
    </div>
);
```

## Advanced Configuration

### Custom Components

You can extend the functionality of the Collection Editor UI Plugin by providing custom UI components. For example, customizing the database field renderer:

```jsx
import CustomDatabaseFieldComponent from "./components/CustomDatabaseFieldComponent";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    components: {
        DatabaseField: CustomDatabaseFieldComponent
    }
});
```

### Custom Permissions Builder

Define custom permissions logic to control what users can do within the collection editor:

```jsx
const customPermissionsBuilder = ({ user }) => ({
    createCollections: user?.isAdmin === true,
    editCollections: user?.roles.includes("editor"),
    deleteCollections: user?.isAdmin === true
});
```

## Example Usage

Below is a comprehensive example of how to integrate the Collection Editor UI Plugin into a FireCMS application.

### Plugin Setup

```jsx
import React, {useCallback} from "react";
import {FireCMS, useBuildNavigationController} from "@firecms/core";
import {mergeCollections, useCollectionEditorPlugin, useFirestoreCollectionsConfigController} from "@firecms/collection_editor";
import {useFirebaseAuthController, useFirestoreDelegate, useInitialiseFirebase, useValidateAuthenticator} from "@firecms/firebase";
import {useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin} from "@firecms/user_management";
import {productsCollection} from "./collections/products_collection";
import {customPermissionsBuilder} from "./config/permissions";
import {CustomCollectionView} from "./views/CustomCollectionView";
import {CollectionIcon} from "./components/CollectionIcon";
import {CustomAuthenticator} from "./auth/CustomAuthenticator";
import {AccessDenied, ErrorDisplay, LoadingIndicator} from "./components/StatusComponents";
import {MainAppLayout} from "./layouts/MainAppLayout";

function App() {
    // Initialize Firebase
    const { firebaseApp, firebaseConfigLoading, configError } = useInitialiseFirebase({
        firebaseConfig
    });

    // Initialize Firestore delegate
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp
    });

    // Initialize Auth Controller
    const authController = useFirebaseAuthController({
        firebaseApp,
        signInOptions: ["google.com", "password"]
    });

    // Initialize Collection Config Controller
    const collectionConfigController = useFirestoreCollectionsConfigController({
        firebaseApp
    });

    // Initialize Collection Editor Plugin
    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        configPermissions: customPermissionsBuilder,
        reservedGroups: ["admin"],
        extraView: {
            View: CustomCollectionView,
            icon: <CollectionIcon />
        }
    });

    // Initialize User Management
    const userManagement = useBuildUserManagement({
        dataSourceDelegate: firestoreDelegate,
        authController: authController
    });

    // Initialize User Management Plugin
    const userManagementPlugin = useUserManagementPlugin({ userManagement });

    // Build Navigation Controller
    const collectionsBuilder = useCallback(() => {
        // Define your own collections
        const collections = [
            productsCollection,
            // Add other collections here
        ];
        // Merge with collections defined via the Collection Editor UI
        return mergeCollections(collections, collectionConfigController.collections ?? []);
    }, [collectionConfigController.collections]);

    const navigationController = useBuildNavigationController({
        collections: collectionsBuilder(),
        views: customViews,
        adminViews: userManagementAdminViews,
        collectionPermissions: collectionEditorPlugin.collectionPermissions,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    // Validate Authenticator
    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        disabled: collectionEditorPlugin.loading,
        authController: authController,
        authenticator: CustomAuthenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    if (firebaseConfigLoading) {
        return <LoadingIndicator />;
    }

    if (configError) {
        return <ErrorDisplay error={configError} />;
    }

    return (
        <FireCMS
            navigationController={navigationController}
            authController={authController}
            dataSourceDelegate={firestoreDelegate}
            plugins={[userManagementPlugin, collectionEditorPlugin]}
        >
            {({ context, loading }) => {
                if (loading || authLoading) {
                    return <LoadingIndicator />;
                }
                if (!canAccessMainView) {
                    return <AccessDenied message={notAllowedError} />;
                }
                return <MainAppLayout />;
            }}
        </FireCMS>
    );
}

export default App;
```

## Customizing the Collection Editor

### Adding Custom Actions

You can add custom actions to your collection views, such as buttons for additional operations.

```jsx
import { EditorCollectionAction } from "./ui/EditorCollectionAction";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    CollectionActionsStart: EditorCollectionActionStart,
    CollectionActions: [EditorCollectionAction],
    // ...other configurations
});
```

### Custom Components

Provide custom components to enhance the UI and functionality of your collection editor.

```jsx
const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    components: {
        PropertyAddColumnComponent: CustomAddColumnComponent
    },
    // ...other configurations
});
```
