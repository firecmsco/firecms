---
title: Importazione dati
slug: it/docs/pro/data_import
---

![data_import.png](/img/data_import.png)

Il **Plugin Data Import** per FireCMS ti consente di importare dati di collezioni da file JSON, CSV, XLSX (Excel) direttamente nella tua applicazione FireCMS. Questo plugin fornisce un'interfaccia dove gli utenti possono caricare file e mappare i dati esistenti alle proprietà della collezione. Questo rende molto conveniente spostare dati da un servizio all'altro e convertire i dati nei tipi di dati corretti nel database.

Il plugin è in grado di eseguire la conversione automatica di alcuni tipi di dati come le date.

La funzionalità di importazione può essere usata anche all'interno del plugin editor collezioni. Nell'editor collezioni, puoi creare nuove collezioni da un file di dati.

## Installazione

```sh
yarn add @firecms/data_import
```

## Configurazione

Integra il Plugin Data Import usando l'hook `useImportPlugin`.

### ImportPluginProps

- **`onAnalyticsEvent`**: Callback attivata su eventi analytics relativi all'importazione.

## Uso dell'hook

```jsx
import React from "react";
import { CircularProgressCenter, FireCMS, useBuildModeController } from "@firecms/core";
import { useFirebaseStorageSource } from "@firecms/firebase";
import { useImportPlugin } from "@firecms/data_import";

export function App() {

    const importPlugin = useImportPlugin({
        onAnalyticsEvent: (event, params) => {
            console.log(`Import Event: ${event}`, params);
            // Integra con il tuo servizio analytics se necessario
        },
    });


    return (
            <FireCMS
                navigationController={navigationController}
                {/*... resto della configurazione */}
            >
              {({ context, loading }) => {
                  // ... i tuoi componenti
              }}
            </FireCMS>
    );
}

export default App;
```

## Uso della funzionalità di importazione

### Passaggi per importare dati

1. **Vai a una Collezione**: Apri la collezione desiderata nella tua applicazione FireCMS.
2. **Avvia l'importazione**: Fai clic sull'azione **Importa** nella toolbar delle azioni.
3. **Carica il file**: Seleziona e carica il file JSON o CSV contenente i dati.
4. **Mappatura tipi di dati**: Seleziona i tipi di dati e come devono essere mappati alla struttura corrente.
5. **Elaborazione dati**: Il plugin elabora il file e aggiunge i dati alla tua collezione.

## Esempio: Tracciare le importazioni con Google Analytics

```jsx
const importPlugin = useImportPlugin({
    onAnalyticsEvent: (event, params) => {
        if (window && window.gtag) {
            window.gtag('event', event, params);
        }
    },
});
```
