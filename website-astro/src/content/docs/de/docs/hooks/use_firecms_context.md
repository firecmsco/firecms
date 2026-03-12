---
slug: de/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Abrufen des Kontexts, der die internen Controller und Kontexte der App enthält.
Einige Controller können auch direkt über ihre entsprechenden Hooks aufgerufen werden.

Die von diesem Hook bereitgestellten Props sind:

* `dataSource`: Verbindung zu Ihrer Datenbank, z.B. Ihrer Firestore-Datenbank

* `storageSource`: Verwendete Speicherimplementierung

* `navigation`: Kontext mit der aufgelösten Navigation und Hilfsmethoden

* `sideEntityController`: Controller zum Öffnen des Seitendialogs mit Entity-Formularen

* `sideDialogsController`: Controller zum Öffnen von Seitendialogen

* `dialogsController`: Controller zum Öffnen regulärer Dialoge

* `authController`: Verwendeter Auth-Controller

* `customizationController`: Controller mit den Anpassungsoptionen für das CMS

* `snackbarController`: Verwendeter Snackbar-Controller zur Anzeige von Snackbars

* `userConfigPersistence`: Controller für browserseitig gespeicherte Benutzerdaten

* `analyticsController`: Callback zum Senden von Analytics-Ereignissen (optional)

* `userManagement`: Abschnitt zur Verwaltung von Benutzern im CMS

Beispiel:

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Auf die Datenquelle zugreifen
    const dataSource = context.dataSource;

    // Einen Snackbar öffnen
    context.snackbarController.open({
        type: "success",
        message: "Beispielnachricht"
    });

    return <div>Beispielansicht</div>;
}
```
