---
title: Plugin System
sidebar_label: Plugins
slug: docs/plugins
description: Extend Rebase with plugins — inject UI components, modify collections, add toolbar actions, and create custom field builders.
---

## Overview

Plugins are the primary extension mechanism in Rebase. They can:

- Wrap the entire app with a **provider** (context, state management)
- Add **home page actions** and widgets
- Inject **collection view** components (toolbar, column builders)
- Add **form** components (field builders, additional panels)
- **Inject or modify collections** dynamically

## Plugin Interface

```typescript
interface RebasePlugin {
    key: string;                    // Unique identifier
    loading?: boolean;              // Show loading state while initializing

    // Wrap the app with a provider
    provider?: {
        Component: React.ComponentType;
    };

    // Home page customization
    homePage?: {
        additionalActions?: React.ReactNode;
        additionalChildrenStart?: React.ReactNode;
        additionalChildrenEnd?: React.ReactNode;
    };

    // Collection view customization
    collectionView?: {
        showTextSearchBar?: boolean;
        CollectionActions?: React.ComponentType[];
        AddColumnComponent?: React.ComponentType;
        onCellValueChange?: (params) => void;
    };

    // Entity form customization
    form?: {
        Actions?: React.ComponentType;
        provider?: { Component: React.ComponentType };
        fieldBuilder?: (params) => React.ReactNode | null;
    };

    // Collection injection/modification
    collection?: {
        injectCollections?: (params) => EntityCollection[];
        modifyCollection?: (params) => EntityCollection;
    };
}
```

## Using Plugins

Pass plugin instances to the navigation controller:

```typescript
const dataEnhancementPlugin = useDataEnhancementPlugin();

const plugins = [dataEnhancementPlugin];

const navigationStateController = useBuildNavigationStateController({
    plugins,
    collections: () => collections,
    // ...
});
```

## Building a Plugin

Here's a minimal plugin that adds a toolbar action to every collection:

```typescript
import { RebasePlugin } from "@rebasepro/types";

function useMyPlugin(): RebasePlugin {
    return {
        key: "my_plugin",

        collectionView: {
            CollectionActions: [MyToolbarAction]
        },

        form: {
            fieldBuilder: ({ property, ...rest }) => {
                // Return a custom field for specific property configs
                if (property.propertyConfig === "my_custom_field") {
                    return <MyCustomField {...rest} />;
                }
                return null; // Use default field
            }
        }
    };
}
```

## Built-in Plugins



### Data Enhancement Plugin

AI-powered field autocompletion:

```typescript
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";

const enhancementPlugin = useDataEnhancementPlugin();
```

![Data enhancement](/img/data_enhancement.png)

## Collection Injection

Plugins can dynamically add new collections:

```typescript
collection: {
    injectCollections: ({ collections, user }) => {
        // Add an audit log collection for admins
        if (user?.roles?.includes("admin")) {
            return [auditLogCollection];
        }
        return [];
    }
}
```

## Collection Modification

Plugins can modify existing collections:

```typescript
collection: {
    modifyCollection: ({ collection }) => {
        // Add a "last_modified_by" field to every collection
        return {
            ...collection,
            properties: {
                ...collection.properties,
                last_modified_by: {
                    type: "string",
                    name: "Modified By",
                    readOnly: true
                }
            }
        };
    }
}
```

## Next Steps

- **[Studio Tools](/docs/studio)** — SQL console, JS console, RLS editor
- **[Custom Fields](/docs/frontend/custom-fields)** — Building custom form fields
