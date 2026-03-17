---
title: Esportazione dati
description: Esporta le tue collezioni Firestore in JSON o CSV con il plugin Data Export di FireCMS.
---

![data_export.png](/img/data_export.png)

Esporta i tuoi dati **Firestore** direttamente dal tuo **pannello admin**. Il Plugin Data Export aggiunge esportazione JSON e CSV con un clic a qualsiasi collezione FireCMS.

:::tip[Casi d'uso comuni]
- **Backup**: Crea snapshot regolari dei tuoi dati
- **Migrazioni**: Sposta dati tra ambienti o database
- **Report**: Alimenta dati in fogli di calcolo o strumenti BI
- **Conformità**: Esporta dati per audit o richieste GDPR
:::

## Installazione

```sh
yarn add @firecms/data_export
```

o

```sh
npm install @firecms/data_export
```

## Configurazione

### Parametri ExportPluginProps

- **`exportAllowed`**: Funzione che determina se l'esportazione è consentita.
    - **Tipo**: `(props: ExportAllowedParams) => boolean`
    - **Predefinito**: `undefined` (l'esportazione è consentita per impostazione predefinita)
- **`notAllowedView`**: Nodo React da visualizzare quando l'esportazione non è consentita.
- **`onAnalyticsEvent`**: Funzione callback attivata su eventi analytics relativi all'esportazione.

### ExportAllowedParams

- **`collectionEntitiesCount`**: Il numero di entità nella collezione.
- **`path`**: Il percorso della collezione in FireCMS.
- **`collection`**: L'entità collezione.

## Uso dell'hook

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
            // Esempio: Consenti l'esportazione solo se ci sono più di 10 entità
            return collectionEntitiesCount > 10;
        },
        notAllowedView: <div>L'esportazione non è consentita.</div>,
        onAnalyticsEvent: (event, params) => {
            console.log(`Export Event: ${event}`, params);
        },
    });

    const plugins = [exportPlugin];

    const navigationController = useBuildNavigationController({
        // ... resto della configurazione
        plugins
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

## Uso della funzionalità di esportazione

Una volta integrato il plugin, puoi usare la funzionalità di esportazione direttamente nelle tue viste collezione. Il plugin aggiunge azioni di esportazione alle viste collezione.

### Esempio: Esportare una collezione

1. Naviga alla collezione desiderata nella tua applicazione FireCMS.
2. Fai clic sull'azione **Esporta** nella toolbar delle azioni della collezione.
3. Scegli il formato di esportazione desiderato (JSON o CSV).
4. Il file esportato verrà scaricato sul tuo dispositivo.

### Esempio: Limitare l'esportazione in base al ruolo utente

```jsx
const exportPlugin = useExportPlugin({
    exportAllowed: ({
                        collection,
                        path,
                        collectionEntitiesCount
                    }) => {
        // Consenti l'esportazione solo agli admin
        return userRoles.includes('admin');
    },
    notAllowedView: <div>Solo gli amministratori possono esportare i dati.</div>,
    onAnalyticsEvent: (event, params) => {
        // Registra gli eventi di esportazione per l'audit
        logAnalytics(event, params);
    },
});
```
