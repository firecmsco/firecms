---
slug: fr/docs/hooks/use_navigation_controller
title: useNavigationController
sidebar_label: useNavigationController
description: Accédez au contrôleur de navigation FireCMS pour obtenir des collections, résoudre des chemins et effectuer la navigation.
---

Utilisez ce hook pour accéder au contrôleur de navigation de l'application. Ce contrôleur sert de point central pour :
* Accéder à la configuration résolue des collections et des vues.
* Résoudre les chemins et les IDs (ex. convertir un chemin URL en chemin de base de données).
* Navigation programmatique.

### Utilisation

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function NavigationExample() {
    const navigationController = useNavigationController();

    const goToProducts = () => {
        // Naviguer vers la collection produits
        // Cela gère le routage correct en dessous
        navigationController.navigate("/c/products");
    };
    
    // Vous pouvez également récupérer des collections par leur ID
    const productsCollection = navigationController.getCollection("products");

    return (
        <div>
            <p>Nom de la collection produits : {productsCollection?.name}</p>
            <Button onClick={goToProducts}>Aller aux Produits</Button>
        </div>
    );
}
```

### Méthodes et propriétés clés

* **`collections`** : Liste de toutes les collections d'entités résolues.
* **`views`** : Liste des vues personnalisées de niveau supérieur.
* **`getCollection(pathOrId, includeUserOverride?)`** : Obtenir une collection par son `id` ou son `path`.
* **`navigate(to, options?)`** : Naviguer vers une route spécifique.
* **`refreshNavigation()`** : Forcer un recalcul de la structure de navigation (utile si vos collections sont dynamiques).
* **`urlPathToDataPath(cmsPath)`** : Convertir une URL CMS en chemin de source de données. Exemple : `/c/products/B34SAP8Z` -> `products/B34SAP8Z`
* **`buildUrlCollectionPath(path)`** : Convertir un chemin de source de données en URL CMS. Exemple : `products` -> `/c/products`
* **`resolveIdsFrom(pathWithAliases)`** : Résoudre les alias dans un chemin vers leurs IDs réels.

### Interface NavigationController

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
    
    // ... méthodes utilitaires pour la résolution de chemin
}
```
