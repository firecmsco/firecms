---
slug: docs/hooks/use_navigation_controller
title: useNavigationController
sidebar_label: useNavigationController
description: Access the FireCMS navigation controller to get collections, resolve paths, and perform navigation.
---

Use this hook to access the navigation controller of the app. This controller serves as the central point for:
*   Accessing the resolved configuration of collections and views.
*   Resolving paths and IDs (e.g. converting a URL path to a database path).
*   Programmatic navigation.

### Usage

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {
    const navigationController = useNavigationController();

    const goToProducts = () => {
        // Navigate to the products collection
        // This handles the correct routing underneath
        navigationController.navigate("/c/products");
    };
    
    // You can also retrieve collections by their ID
    const productsCollection = navigationController.getCollection("products");

    return (
        <div>
            <p>Products collection name: {productsCollection?.name}</p>
            <Button onClick={goToProducts}>Go to Products</Button>
        </div>
    );
}
```

### Key Methods & Properties

*   **`collections`**: List of all resolved entity collections.
*   **`views`**: List of custom top-level views.
*   **`getCollection(pathOrId, includeUserOverride?)`**: Get a collection by its `id` or `path`.
*   **`navigate(to, options?)`**: Navigate to a specific route.
*   **`refreshNavigation()`**: Force a re-calculation of the navigation structure (useful if your collections are dynamic).
*   **`urlPathToDataPath(cmsPath)`**: Convert a CMS URL to a datasource path.
    *   Example: `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
*   **`buildUrlCollectionPath(path)`**: Convert a datasource path to a CMS URL.
    *   Example: `products` -> `/c/products`
*   **`resolveIdsFrom(pathWithAliases)`**: Resolve aliases in a path to their actual IDs.

### NavigationController Interface

```tsx
export type NavigationController = {
    collections?: EntityCollection[];
    views?: CMSView[];
    loading: boolean;
    initialised: boolean;
    
    getCollection: (pathOrId: string, includeUserOverride?: boolean) => EntityCollection | undefined;
    getCollectionById: (id: string) => EntityCollection | undefined;
    
    navigate: (to: string, options?: NavigateOptions) => void;
    refreshNavigation: () => void;
    
    // ... utility methods for path resolution
}
```
