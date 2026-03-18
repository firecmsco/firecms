---
slug: fr/docs/hooks/use_analytics_controller
title: useAnalyticsController
sidebar_label: useAnalyticsController
description: Hook pour accéder au contrôleur d'analytiques et écouter les événements du CMS.
---

Hook pour accéder au contrôleur d'analytiques. Ce contrôleur vous permet d'écouter les événements internes du CMS, tels que la navigation, la création d'entités, l'édition, etc.

Vous pouvez l'utiliser pour vous intégrer avec des fournisseurs d'analytiques tiers comme Google Analytics, Mixpanel ou Segment.

### Utilisation

```tsx
import { useAnalyticsController } from "@firecms/core";
import { useEffect } from "react";

export function MyAnalyticsComponent() {
    const analyticsController = useAnalyticsController();

    useEffect(() => {
        // Vous configureriez normalement ceci dans le point d'entrée principal de votre application
        // Ceci est uniquement à des fins de démonstration
        console.log("Analytics controller available");
    }, [analyticsController]);

    return null;
}
```

### Interface

```tsx
export type AnalyticsController = {
    /**
     * Callback utilisé pour recevoir les événements d'analytiques du CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
}
```

### Événements

Le type `CMSAnalyticsEvent` définit tous les événements possibles :

* `entity_click` : L'utilisateur a cliqué sur une entité dans une collection
* `edit_entity_clicked` : L'utilisateur a cliqué sur le bouton « Modifier »
* `new_entity_click` : L'utilisateur a cliqué sur le bouton « Nouveau »
* `new_entity_saved` : Une nouvelle entité a été créée avec succès
* `entity_edited` : Une entité a été mise à jour
* `entity_deleted` : Une entité a été supprimée
* `drawer_navigate_to_collection` : L'utilisateur a navigué vers une collection depuis le tiroir latéral
* `home_navigate_to_collection` : L'utilisateur a navigué vers une collection depuis la page d'accueil
* ... et plus encore.
