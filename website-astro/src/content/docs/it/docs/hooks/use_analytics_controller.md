---
slug: it/docs/hooks/use_analytics_controller
title: useAnalyticsController
sidebar_label: useAnalyticsController
description: Hook per accedere al controller di analytics e ascoltare gli eventi del CMS.
---

Hook per accedere al controller di analytics. Questo controller consente di ascoltare gli eventi interni del CMS, come navigazione, creazione di entità, modifica, ecc.

Puoi utilizzarlo per integrarti con provider di analytics di terze parti come Google Analytics, Mixpanel o Segment.

### Utilizzo

```tsx
import { useAnalyticsController } from "@firecms/core";
import { useEffect } from "react";

export function MyAnalyticsComponent() {
    const analyticsController = useAnalyticsController();

    useEffect(() => {
        // Normalmente configureresti questo nel punto di ingresso principale della tua applicazione
        // Questo è solo a scopo dimostrativo
        console.log("Analytics controller available");
    }, [analyticsController]);

    return null;
}
```

### Interfaccia

```tsx
export type AnalyticsController = {
    /**
     * Callback utilizzato per ricevere gli eventi di analytics dal CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
}
```

### Eventi

Il tipo `CMSAnalyticsEvent` definisce tutti gli eventi possibili:

* `entity_click`: L'utente ha cliccato su un'entità in una collezione
* `edit_entity_clicked`: L'utente ha cliccato sul pulsante di modifica
* `new_entity_click`: L'utente ha cliccato sul pulsante "Nuovo"
* `new_entity_saved`: Una nuova entità è stata creata con successo
* `entity_edited`: Un'entità è stata aggiornata
* `entity_deleted`: Un'entità è stata eliminata
* `drawer_navigate_to_collection`: L'utente ha navigato verso una collezione dal menu laterale
* `home_navigate_to_collection`: L'utente ha navigato verso una collezione dalla pagina principale
* ... e altro ancora.
