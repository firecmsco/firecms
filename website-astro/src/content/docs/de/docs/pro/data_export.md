---
title: Datenexport
slug: de/docs/pro/data_export
description: Exportieren Sie Ihre Firestore-Kollektionen als JSON oder CSV mit dem FireCMS Data Export Plugin. Ideal für Backups, Migrationen und Datenanalysen.
---

![data_export.png](/img/data_export.png)

Das **Data Export Plugin** für FireCMS ermöglicht es Ihnen, Kollektionsdaten als JSON- oder CSV-Dateien herunterzuladen.
Dieser einfach integrierbare Plugin fügt Export-Aktionen zu Ihren Kollektionsansichten hinzu.

## Installation

```sh
yarn add @firecms/data_export
```

## Verwendung

```jsx
import React from "react";
import { FireCMS } from "@firecms/core";
import { useExportPlugin } from "@firecms/data_export";

function App() {
    
    const exportPlugin = useExportPlugin({
        exportAllowed: ({
                            collectionEntitiesCount,
                            path,
                            collection
                        }) => {
            // Beispiel: Export nur erlauben, wenn mehr als 10 Entities vorhanden sind
            return collectionEntitiesCount > 10;
        },
        notAllowedView: <div>Export ist nicht erlaubt.</div>,
        onAnalyticsEvent: (event, params) => {
            console.log(`Export-Ereignis: ${event}`, params);
        },
    });

    // ...
}
```

## Exportdaten verwenden

Sobald das Plugin integriert ist, steht die Exportfunktion in Ihren Kollektionsansichten zur Verfügung:

1. Navigieren Sie zur gewünschten Kollektion.
2. Klicken Sie auf die **Export**-Aktion in der Aktionsleiste.
3. Wählen Sie das gewünschte Exportformat (JSON oder CSV).
4. Die exportierte Datei wird auf Ihr Gerät heruntergeladen.

## ExportPluginProps

- **`exportAllowed`**: Funktion, die bestimmt, ob der Export erlaubt ist.
- **`notAllowedView`**: React-Node, der angezeigt wird, wenn der Export nicht erlaubt ist.
- **`onAnalyticsEvent`**: Callback für Analytics-Ereignisse.
