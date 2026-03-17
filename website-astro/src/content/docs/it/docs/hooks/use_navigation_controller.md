---
title: useNavigationController
sidebar_label: useNavigationController
description: Accedi al controller di navigazione di FireCMS per ottenere collezioni, risolvere percorsi ed eseguire la navigazione.
---

Usa questo hook per accedere al controller di navigazione dell'app. Questo controller è il punto centrale per:
*   Accedere alla configurazione risolta di collezioni e viste.
*   Risolvere percorsi e ID (es. convertire un percorso URL in un percorso del database).
*   Navigazione programmatica.

### Utilizzo

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {
    const navigationController = useNavigationController();

    const goToProducts = () => {
        // Naviga alla collezione prodotti
        // Gestisce il routing corretto internamente
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
*   **`views`**: Lista delle viste personalizzate top-level.
*   **`getCollection(pathOrId, includeUserOverride?)`**: Ottieni una collezione tramite il suo `id` o `path`.
*   **`navigate(to, options?)`**: Naviga verso una route specifica.
*   **`refreshNavigation()`**: Forza il ricalcolo della struttura di navigazione (utile se le tue collezioni sono dinamiche).
*   **`urlPathToDataPath(cmsPath)`**: Converti un URL del CMS in un percorso della sorgente dati.
    *   Esempio: `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
*   **`buildUrlCollectionPath(path)`**: Converti un percorso della sorgente dati in un URL del CMS.
    *   Esempio: `products` -> `/c/products`
*   **`resolveIdsFrom(pathWithAliases)`**: Risolvi gli alias in un percorso con i loro ID effettivi.

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
    
    // ... metodi di utilità per la risoluzione dei percorsi
}
```
