---
slug: it/docs/hooks/use_navigation_controller
title: useNavigationController
sidebar_label: useNavigationController
description: Accedi al controller di navigazione di FireCMS per ottenere collezioni, risolvere percorsi e navigare.
---

Usa questo hook per accedere al controller di navigazione dell'app. Questo controller funge da punto centrale per:
*   Accedere alla configurazione risolta di collezioni e viste.
*   Risolvere percorsi e ID (ad esempio, convertire un percorso URL in un percorso del database).
*   Navigazione programmatica.

### Utilizzo

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {
    const navigationController = useNavigationController();

    const goToProducts = () => {
        // Naviga alla collezione dei prodotti
        // Questo gestisce il routing corretto internamente
        navigationController.navigate("/c/products");
    };
    
    // Puoi anche recuperare le collezioni tramite il loro ID
    const productsCollection = navigationController.getCollection("products");

    return (
        <div>
            <p>Nome della collezione prodotti: {productsCollection?.name}</p>
            <Button onClick={goToProducts}>Vai ai Prodotti</Button>
        </div>
    );
}
```

### Metodi e proprietà principali

*   **`collections`**: Lista di tutte le collezioni di entità risolte.
*   **`views`**: Lista delle viste personalizzate di livello superiore.
*   **`getCollection(pathOrId, includeUserOverride?)`**: Ottenere una collezione tramite il suo `id` o `path`.
*   **`navigate(to, options?)`**: Navigare verso una rotta specifica.
*   **`refreshNavigation()`**: Forzare un ricalcolo della struttura di navigazione (utile se le collezioni sono dinamiche).
*   **`urlPathToDataPath(cmsPath)`**: Convertire un URL del CMS in un percorso della fonte dati.
    *   Esempio: `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
*   **`buildUrlCollectionPath(path)`**: Convertire un percorso della fonte dati in un URL del CMS.
    *   Esempio: `products` -> `/c/products`
*   **`resolveIdsFrom(pathWithAliases)`**: Risolvere gli alias in un percorso ai loro ID effettivi.

### Interfaccia NavigationController

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
    
    // ... metodi utilitari per la risoluzione dei percorsi
}
```
