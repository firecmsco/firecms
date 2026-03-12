---
slug: de/docs/pro/data_import
title: Datenimport
---

![data_import.png](/img/data_import.png)

Das **Data Import Plugin** für FireCMS ermöglicht es Ihnen, Kollektionsdaten aus JSON-, CSV- oder XLSX- (Excel-) Dateien direkt in Ihre FireCMS-Anwendung zu importieren.

Das Plugin bietet eine Benutzeroberfläche, über die Benutzer Dateien hochladen und die vorhandenen Daten den Kollektionseigenschaften zuordnen können.

## Installation

```sh
yarn add @firecms/data_import
```

## Verwendung

```jsx
import React from "react";
import { FireCMS } from "@firecms/core";
import { useImportPlugin } from "@firecms/data_import";

export function App() {

    const importPlugin = useImportPlugin({
        onAnalyticsEvent: (event, params) => {
            console.log(`Import-Ereignis: ${event}`, params);
        },
    });

    return (
        <FireCMS
            navigationController={navigationController}
            /* ... weitere Konfiguration */
        >
          {({ context, loading }) => {
              // ... Ihre Komponenten
          }}
        </FireCMS>
    );
}
```

## Importdaten verwenden

1. **Zu einer Kollektion navigieren**: Öffnen Sie die gewünschte Kollektion.
2. **Import initiieren**: Klicken Sie auf **Import** in der Aktionsleiste der Kollektion.
3. **Datei hochladen**: Wählen Sie die JSON-, CSV- oder XLSX-Datei aus.
4. **Datentypzuordnung**: Wählen Sie die Datentypen und wie Ihre Daten zur aktuellen Struktur zugeordnet werden sollen.
5. **Datenverarbeitung**: Das Plugin verarbeitet die Datei und fügt die Daten in Ihre Kollektion ein.
