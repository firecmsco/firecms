---
slug: docs/pro/collection_editor
title: Collection Editor UI
---

![collection_editor.png](/img/collection_editor.png)

This document describes how to use the **Collection Editor UI Plugin** with **Rebase** to manage and configure your
database collections. The Collection Editor UI Plugin provides an interface for creating, editing, and organizing
collections, with support for customizable permissions and configuration options.

Typically, collections in Rebase are defined in code, and passed as a prop to the `NavigationController` on
initialization. The Collection Editor UI Plugin allows you to manage collections directly in the application, providing 
a more user-friendly and flexible way to organize and configure your database collections.

In this document, we will cover how to set up and use this plugin in your Rebase application.

## Installation

First, ensure you have installed the necessary dependencies. To use the Collection Editor UI Plugin, you need to have
Rebase set up in your project.

```sh
yarn add @rebasepro/collection_editor
```
or
```sh
npm install @rebasepro/collection_editor
```

## Configuration

The plugin requires several configurations, including controllers for managing collection configurations, permissions,
and custom views.

### Default Configuration

The Collection Editor UI Plugin integrates with your backend to store and manage collection configurations. By
default, configurations are managed internally, but you can customize paths and behaviors as needed.

### Database Security

Ensure that your database security policies (e.g., Postgres RLS policies) allow the plugin to read and write to the configuration paths. Below is an
example of RLS policies that permit authenticated users to access the collection configurations:

```sql
-- Allow authenticated users to read collection configurations
CREATE POLICY "Allow read access to collection configs"
ON "__rebase_config"
FOR SELECT
TO authenticated
USING (true);

-- Allow admin users to write collection configurations
CREATE POLICY "Allow write access for admins"
ON "__rebase_config"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "__rebase_users"
    WHERE uid = auth.uid() AND role = 'admin'
  )
);
```

## Collection Configuration Plugin

The Collection Editor UI Plugin allows you to include a UI for editing collection configurations. You can choose where
the configuration is stored and pass the configuration to the plugin. The plugin includes a controller that saves the
configuration in your database. The default path is `__REBASE/config/collections`.

The controller includes methods you can use in your components to manage the collection configuration.

```jsx
const collectionConfigController = useCollectionsConfigController({
    dataSource: postgresDelegate
});
```

You can define your collections in code or use the UI to define them. It is also possible to allow modification in the
UI of collections defined in code. You can then merge the collections defined in code with those defined in the UI.

```jsx
import { useCallback } from "react";
import { mergeCollections } from "@rebasepro/collection_editor";
import { productsCollection } from "./collections/products_collection";

// The collection builder is passed to the navigation controller
const collectionsBuilder = useCallback(() => {
    // Define a sample collection in code.
    const collections = [
        productsCollection
        // Your collections here
    ];
    // Merge collections defined in the collection editor (UI) with your own collections
    return mergeCollections(collections, collectionConfigController.collections ?? []);
}, [collectionConfigController.collections]);
```

To add the Collection Editor UI Plugin, include it in the list of plugins passed to the `Rebase` component.

```jsx
const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController
});
```

This will add an icon in each collection card that allows you to edit the collection configuration.

## Hook Usage

The main hook to utilize the plugin's functionality is `useCollectionEditorPlugin`. Here's an example of how to use it:

```jsx
import { useCollectionEditorPlugin } from "@rebasepro/collection_editor";

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

To integrate the Collection Editor UI Plugin into Rebase, use the `useCollectionEditorPlugin` hook and pass the
resulting plugin into the Rebase configuration. This is typically done in your main App component.

### Example Configuration

```jsx
import React, { useCallback } from "react";
import { Rebase, useBuildNavigationController, useAuthController } from "@rebasepro/core";
import { mergeCollections, useCollectionEditorPlugin, useCollectionsConfigController } from "@rebasepro/collection_editor";
import { usePostgresDataSource } from "@rebasepro/postgresql";
import { useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin } from "@rebasepro/user_management";
import { productsCollection } from "./collections/products_collection";
import { customPermissionsBuilder } from "./config/permissions";
import { CustomCollectionView } from "./views/CustomCollectionView";
import { CollectionIcon } from "./components/CollectionIcon";

function App() {
    const postgresDelegate = usePostgresDataSource({
        // your database configuration
    });

    const authController = useAuthController({
        signInOptions: ["google.com", "password"]
    });

    const collectionConfigController = useCollectionsConfigController({
        dataSource: postgresDelegate
    });

    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController,
        configPermissions: customPermissionsBuilder,
        reservedGroups: ["admin"],
        extraView: {
            View: CustomCollectionView,
            icon: <CollectionIcon/>
        }
    });

    const userManagement = useBuildUserManagement({
        dataSource: postgresDelegate,
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

    const plugins = [
        collectionEditorPlugin,
        userManagementPlugin
    ];
    
    const navigationController = useBuildNavigationController({
        collections: collectionsBuilder(),
        views: customViews,
        adminViews: userManagementAdminViews,
        collectionPermissions: collectionEditorPlugin.collectionPermissions,
        authController,
        dataSource: postgresDelegate,
        plugins
    });

    const {
        authLoading,
        canAccessMainView,
        notAllowedError
    } = useValidateAuthenticator({
        disabled: collectionEditorPlugin.loading,
        authController: authController,
        authenticator: customAuthenticator,
        dataSource: postgresDelegate
    });

    return (
        <Rebase
            navigationController={navigationController}
            authController={authController}
            dataSource={postgresDelegate}
        >
            {({
                  context,
                  loading
              }) => {
                if (loading || authLoading) {
                    return <LoadingSpinner/>;
                }
                if (!canAccessMainView) {
                    return <AccessDenied message={notAllowedError}/>;
                }
                return <MainAppLayout/>;
            }}
        </Rebase>
    );
}

export default App;
```

## Adding the Collection Editor Views

The Collection Editor UI Plugin provides custom views that need to be added to your Rebase project. These views are
integrated into the Rebase navigation and allow users to manage collections.

### Example Integration

```jsx
import { useCollectionEditorPlugin } from "@rebasepro/collection_editor";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"],
    extraView: {
        View: CustomCollectionView,
        icon: <CollectionIcon/>
    }
});

// Include the plugin in your Rebase configuration
<Rebase
    navigationController={navigationController}
    authController={authController}
    dataSource={postgresDelegate}
    plugins={[userManagementPlugin, collectionEditorPlugin]}
>
    {/* Your application components */}
</Rebase>
```

## Authenticating Users

The Collection Editor UI Plugin integrates with your authentication system to ensure that only authorized users can
manage collections. You can use the `useValidateAuthenticator` hook to authenticate users and determine their access
levels.

### Example Usage

```jsx
import { useValidateAuthenticator } from "@rebasepro/core";

const {
    authLoading,
    canAccessMainView,
    notAllowedError
} = useValidateAuthenticator({
    disabled: collectionEditorPlugin.loading,
    authController: authController,
    authenticator: customAuthenticator,
    dataSource: postgresDelegate
});

if (authLoading) {
    return <LoadingIndicator/>;
}

if (!canAccessMainView) {
    return <AccessDeniedError message={notAllowedError}/>;
}

// Render your main application view
```

## Integrating Collection Permissions

The Collection Editor UI Plugin includes a `collectionPermissions` function that determines what operations a user can
perform based on their roles and the collection configuration. This function ensures that users have appropriate access
rights throughout your Rebase project.

### Example Integration

```jsx
const navigationController = useBuildNavigationController({
    collections: customCollections,
    views: customViews,
    adminViews: userManagementAdminViews,
    collectionPermissions: collectionEditorPlugin.collectionPermissions,
    authController,
    dataSource: postgresDelegate
});
```

**Note:** Applying permissions to a collection overrides the permissions set in the collection configuration.

## Error Handling

The plugin provides error handling through properties such as `configError` and `collectionErrors` in the
`CollectionEditor` object. These can be used to detect and display error messages when loading or managing collections.

### Example Error Handling

```jsx
if (collectionEditorPlugin.configError) {
    return <ErrorDisplay error={collectionEditorPlugin.configError}/>;
}

if (collectionEditorPlugin.collectionErrors) {
    return <ErrorDisplay error={collectionEditorPlugin.collectionErrors}/>;
}
```

## Using the Plugin within Your Application

Once you have set up the Collection Editor UI Plugin, you will have access to tools and functions for managing your
database collections. You can access the collection management functions and data through the
`useCollectionEditorPlugin` hook.

### Collection Editor Object

The `collectionEditor` object returned by the `useCollectionEditorPlugin` hook includes the following properties:

- **`loading`**: Indicates if the collection data is being loaded. Boolean value.
- **`collections`**: Array of collection objects. Contains the collections being managed.
- **`saveCollection`**: Function to persist a collection. Takes a `collection` object and returns a promise resolving
  with the saved collection.
- **`deleteCollection`**: Function to delete a collection. Takes a `collection` object and returns a promise resolving
  when the collection is deleted.
- **`configError`**: Holds any error that occurred while loading collection configurations.
- **`collectionPermissions`**: Function that defines the permissions for collections based on user roles and collection
  configurations.
- **`createCollection`**: Function to initiate the creation of a new collection.
- **`reservedGroups`**: Array of group names that are reserved and cannot be used in collection names.
- **`extraView`**: Custom view added to the Rebase navigation for collection management.
- **`defineRolesFor`**: Function to define roles for a given user, typically integrated into your auth controller.
- **`authenticator`**: Optional. Authenticator callback built from the current configuration of the collection editor.
  It will only allow access to users with the required roles.

### Example Access

```jsx
import { useCollectionEditorPlugin } from "@rebasepro/collection_editor";

const collectionEditor = useCollectionEditorPlugin({
    collectionConfigController,
    configPermissions: customPermissionsBuilder,
    reservedGroups: ["admin"]
});

// Use collectionEditor properties and functions
if (collectionEditor.loading) {
    return <LoadingIndicator/>;
}

return (
    <div>
        {collectionEditor.collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection}/>
        ))}
        <Button onClick={() => collectionEditor.createCollection()}>
            Create New Collection
        </Button>
    </div>
);
```

## Advanced Configuration

### Custom Components

You can modify the UI and functionality of the Collection Editor UI Plugin by providing custom UI components. For
example, customizing the database field renderer:

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

Below is an example of how to integrate the Collection Editor UI Plugin into a Rebase application.

### Plugin Setup

```jsx
import React, { useCallback, useMemo } from "react";

import "typeface-rubik";
import "@fontsource/jetbrains-mono";
import {
  AppBar,
  CircularProgressCenter,
  CMSView,
  Drawer,
  Rebase,
  ModeControllerProvider,
  NavigationRoutes,
  Scaffold,
  SideDialogs,
  SnackbarProvider,
  useBuildLocalConfigurationPersistence,
  useBuildModeController,
  useBuildNavigationController,
  useValidateAuthenticator,
  useAuthController
} from "@rebasepro/core";
import { usePostgresDataSource } from "@rebasepro/postgresql";
import { useCollectionsConfigController, mergeCollections, useCollectionEditorPlugin } from "@rebasepro/collection_editor";

import { productsCollection } from "./collections/products";

export function App() {

  const title = "My CMS app";

  const postgresDelegate = usePostgresDataSource({
    // your database configuration
  });

  /**
   * Controller used to save the collection configuration in the database.
   * Note that this is optional and you can define your collections in code.
   */
  const collectionConfigController = useCollectionsConfigController({
    dataSource: postgresDelegate
  });

  const collectionsBuilder = useCallback(() => {
    // Here we define a sample collection in code.
    const collections = [
      productsCollection
      // Your collections here
    ];
    // You can merge collections defined in the collection editor (UI) with your own collections
    return mergeCollections(collections, collectionConfigController.collections ?? []);
  }, [collectionConfigController.collections]);

  const signInOptions = ["google.com", "password"];

  /**
   * Controller used to manage the dark or light color mode
   */
  const modeController = useBuildModeController();

  /**
   * Controller for managing authentication
   */
  const authController = useAuthController({
    signInOptions,
  });

  /**
   * Controller for saving some user preferences locally.
   */
  const userConfigPersistence = useBuildLocalConfigurationPersistence();

  /**
   * Use the authenticator to control access to the main view
   */
  const {
    authLoading,
    canAccessMainView,
    notAllowedError
  } = useValidateAuthenticator({
    authController,
    dataSource: postgresDelegate
  });

  const navigationController = useBuildNavigationController({
    collections: collectionsBuilder,
    authController,
    dataSource: postgresDelegate
  });

  const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController
  });

  return (
          <SnackbarProvider>
            <ModeControllerProvider value={modeController}>

              <Rebase
                      apiKey={import.meta.env.VITE_REBASE_API_KEY}
                      navigationController={navigationController}
                      authController={authController}
                      userConfigPersistence={userConfigPersistence}
                      dataSource={postgresDelegate}
                      plugins={[
                        collectionEditorPlugin
                      ]}
              >
                {({
                    context,
                    loading
                  }) => {

                  let component;
                  if (loading || authLoading) {
                    component = <CircularProgressCenter/>;
                  } else {
                    if (!canAccessMainView) {
                      component = (
                              <LoginView
                                      allowSkipLogin={false}
                                      signInOptions={signInOptions}
                                      authController={authController}
                                      notAllowedError={notAllowedError}/>
                      );
                    } else {
                      component = (
                              <Scaffold
                                      // logo={...}
                                      autoOpenDrawer={false}>
                                <AppBar title={title}/>
                                <Drawer/>
                                <NavigationRoutes/>
                                <SideDialogs/>
                              </Scaffold>
                      );
                    }
                  }

                  return component;
                }}
              </Rebase>
            </ModeControllerProvider>
          </SnackbarProvider>
  );
}
```
