---
slug: it/docs/hooks/use_firecms_context
title: useFireCMSContext
sidebar_label: useFireCMSContext
---

Ottiene il contesto che include i controller interni e i contesti utilizzati dall'applicazione.
Alcuni controller e contesti inclusi possono essere acceduti
direttamente dai rispettivi hook.

Le proprietà fornite da questo hook sono:

* `dataSource`: Connettore al tuo database, ad esempio il tuo database Firestore

* `storageSource`: Implementazione di archiviazione utilizzata

* `navigation`: Contesto che include la navigazione risolta e metodi e
  attributi utilitari.

* `sideEntityController`: Controller per aprire il dialogo laterale che mostra i form delle entità

* `sideDialogsController`: Controller utilizzato per aprire i dialoghi laterali (utilizzato internamente dai
  dialoghi laterali delle entità o dai dialoghi di riferimento)

* `dialogsController`: Controller utilizzato per aprire dialoghi regolari

* `authController`: Controller di autenticazione utilizzato

* `customizationController`: Controller che contiene le opzioni di personalizzazione del CMS

* `snackbarController`: Usa questo controller per visualizzare le snackbar

* `userConfigPersistence`: Usa questo controller per accedere ai dati memorizzati nel browser dell'utente

* `analyticsController`: Callback per inviare eventi di analytics (opzionale)

* `userManagement`: Sezione utilizzata per gestire gli utenti nel CMS. Usata per mostrare le informazioni
  dell'utente in vari punti e assegnare la proprietà delle entità.

Esempio:

```tsx
import React from "react";
import { useFireCMSContext } from "@firecms/core";

export function ExampleCMSView() {

    const context = useFireCMSContext();

    // Accedere alla fonte dati
    const dataSource = context.dataSource;

    // Aprire una snackbar
    context.snackbarController.open({
        type: "success",
        message: "Messaggio di esempio"
    });

    return <div>Vista di esempio</div>;
}
```
