---
slug: de/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Ruft den Kontext ab, der die internen Controller und Kontexte enthält, die von der Anwendung verwendet werden.
Einige Controller und Kontexte in diesem Kontext können direkt über ihre
jeweiligen Hooks abgerufen werden.

Die von diesem Hook bereitgestellten Eigenschaften sind:

* `dataSource`: Konnektor zu Ihrer Datenbank, z.B. Ihre Firestore-Datenbank

* `storageSource`: Verwendete Speicherimplementierung

* `navigation`: Kontext, der die aufgelöste Navigation sowie Hilfsmethoden und
  Attribute enthält.

* `sideEntityController`: Controller zum Öffnen des Seitendialogs, der Entitätsformulare anzeigt

* `sideDialogsController`: Controller zum Öffnen von Seitendialogen (wird intern von
  Seitendialogen für Entitäten oder Referenzdialogen verwendet)

* `dialogsController`: Controller zum Öffnen regulärer Dialoge

* `authController`: Verwendeter Authentifizierungs-Controller

* `customizationController`: Controller mit den Anpassungsoptionen für das CMS

* `snackbarController`: Verwenden Sie diesen Controller, um Snackbars anzuzeigen

* `userConfigPersistence`: Verwenden Sie diesen Controller, um auf im Browser gespeicherte Benutzerdaten zuzugreifen

* `analyticsController`: Callback zum Senden von Analytics-Ereignissen (optional)

* `userManagement`: Bereich zur Verwaltung von Benutzern im CMS. Wird verwendet, um Benutzerinformationen
  an verschiedenen Stellen anzuzeigen und die Entitätszugehörigkeit zuzuweisen.

Beispiel:

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Auf die Datenquelle zugreifen
    const dataSource = context.dataSource;

    // Eine Snackbar öffnen
    context.snackbarController.open({
        type: "success",
        message: "Beispielnachricht"
    });

    return <div>Beispielansicht</div>;
}
```
