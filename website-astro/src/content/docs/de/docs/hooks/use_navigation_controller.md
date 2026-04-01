---
slug: de/docs/hooks/use_navigation_controller
title: useNavigationController
sidebar_label: useNavigationController
description: Zugriff auf den FireCMS-Navigationscontroller zum Abrufen von Sammlungen, Auflösen von Pfaden und zur Navigation.
---

Verwenden Sie diesen Hook, um auf den Navigationscontroller der App zuzugreifen. Dieser Controller dient als zentraler Punkt für:
*   Zugriff auf die aufgelöste Konfiguration von Sammlungen und Ansichten.
*   Auflösung von Pfaden und IDs (z.B. Konvertierung eines URL-Pfads in einen Datenbankpfad).
*   Programmatische Navigation.

### Verwendung

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {
    const navigationController = useNavigationController();

    const goToProducts = () => {
        // Zur Produktsammlung navigieren
        // Dies übernimmt das korrekte Routing intern
        navigationController.navigate("/c/products");
    };
    
    // Sie können Sammlungen auch über ihre ID abrufen
    const productsCollection = navigationController.getCollection("products");

    return (
        <div>
            <p>Name der Produktsammlung: {productsCollection?.name}</p>
            <Button onClick={goToProducts}>Zu Produkten</Button>
        </div>
    );
}
```

### Wichtige Methoden & Eigenschaften

*   **`collections`**: Liste aller aufgelösten Entitätssammlungen.
*   **`views`**: Liste der benutzerdefinierten Top-Level-Ansichten.
*   **`getCollection(pathOrId, includeUserOverride?)`**: Eine Sammlung über ihre `id` oder ihren `path` abrufen.
*   **`navigate(to, options?)`**: Zu einer bestimmten Route navigieren.
*   **`refreshNavigation()`**: Neuberechnung der Navigationsstruktur erzwingen (nützlich bei dynamischen Sammlungen).
*   **`urlPathToDataPath(cmsPath)`**: Eine CMS-URL in einen Datenquellenpfad umwandeln.
    *   Beispiel: `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
*   **`buildUrlCollectionPath(path)`**: Einen Datenquellenpfad in eine CMS-URL umwandeln.
    *   Beispiel: `products` -> `/c/products`
*   **`resolveIdsFrom(pathWithAliases)`**: Aliase in einem Pfad zu ihren tatsächlichen IDs auflösen.

### NavigationController-Schnittstelle

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
    
    // ... Hilfsmethoden für die Pfadauflösung
}
```
