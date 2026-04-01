---
slug: de/docs/hooks/use_analytics_controller
title: useAnalyticsController
sidebar_label: useAnalyticsController
description: Hook für den Zugriff auf den Analytics-Controller und das Abhören von CMS-Ereignissen.
---

Hook für den Zugriff auf den Analytics-Controller. Dieser Controller ermöglicht es Ihnen, interne Ereignisse im CMS abzuhören, wie Navigation, Entitätserstellung, Bearbeitung usw.

Sie können dies nutzen, um sich mit Drittanbieter-Analysediensten wie Google Analytics, Mixpanel oder Segment zu integrieren.

### Verwendung

```tsx
import { useAnalyticsController } from "@firecms/core";
import { useEffect } from "react";

export function MyAnalyticsComponent() {
    const analyticsController = useAnalyticsController();

    useEffect(() => {
        // Normalerweise würden Sie dies in Ihrem Haupteinstiegspunkt einrichten
        // Dies dient nur zur Demonstration
        console.log("Analytics controller available");
    }, [analyticsController]);

    return null;
}
```

### Schnittstelle

```tsx
export type AnalyticsController = {
    /**
     * Callback zum Empfangen von Analytics-Ereignissen vom CMS
     */
    onAnalyticsEvent?: (event: CMSAnalyticsEvent, data?: object) => void;
}
```

### Ereignisse

Der Typ `CMSAnalyticsEvent` definiert alle möglichen Ereignisse:

* `entity_click`: Benutzer hat auf eine Entität in einer Sammlung geklickt
* `edit_entity_clicked`: Benutzer hat auf die Schaltfläche „Bearbeiten" geklickt
* `new_entity_click`: Benutzer hat auf die Schaltfläche „Neu" geklickt
* `new_entity_saved`: Eine neue Entität wurde erfolgreich erstellt
* `entity_edited`: Eine Entität wurde aktualisiert
* `entity_deleted`: Eine Entität wurde gelöscht
* `drawer_navigate_to_collection`: Benutzer hat über die Seitenleiste zu einer Sammlung navigiert
* `home_navigate_to_collection`: Benutzer hat von der Startseite zu einer Sammlung navigiert
* ... und mehr.
