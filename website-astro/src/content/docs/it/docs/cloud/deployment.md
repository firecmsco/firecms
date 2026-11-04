---
title: "Distribuzione del tuo CMS Firebase e pannello admin"
slug: it/docs/cloud/deployment
sidebar_label: Distribuzione
description: "Distribuisci il tuo codice CMS e pannello admin React personalizzato su FireCMS Cloud."
---

## Distribuzione su FireCMS Cloud

FireCMS è unico tra i CMS in quanto permette di caricare codice personalizzato nella sua versione Cloud. Questa è una funzionalità molto avanzata che ti consente di personalizzare il CMS secondo le tue esigenze.

Il codice viene bundlato e compilato usando **module federation** e **vite**. Questo significa che puoi usare qualsiasi pacchetto npm per costruire il tuo CMS.
Il bundle non includerà nessuna delle dipendenze già incluse in FireCMS, quindi puoi usare qualsiasi versione di qualsiasi pacchetto.

Distribuisci il tuo codice su [FireCMS Cloud](https://app.firecms.co) con un singolo comando:

```bash
npm run deploy
```

o

```bash
yarn deploy
```

Il vantaggio di questo approccio è che puoi usare qualsiasi pacchetto npm e puoi usare la versione più recente di FireCMS senza dover aggiornare manualmente il tuo codice.

### CLI FireCMS

La CLI FireCMS è uno strumento che ti permette di distribuire il tuo CMS su FireCMS Cloud con un singolo comando. Nel tuo progetto, dovresti avere `firecms` come dipendenza dev.

I comandi disponibili sono:

```bash
firecms login
```

```bash
firecms logout
```

e

```bash
firecms deploy --project=your-project-id
```

## Importare Firebase nel tuo codice

FireCMS Cloud fornisce React, i pacchetti FireCMS e l'SDK di Firebase al tuo codice, quindi la tua
build non ne contiene alcuna copia. Sono i pacchetti elencati sotto `shared` nel tuo
`vite.config.ts`, e solo gli import che ne nominano uno esattamente ricevono la copia di FireCMS.

Per Firebase, questo significa importare dai pacchetti `@firebase/…`, non dagli entry point
`firebase/…`:

```ts
// No: la build punta a un file che non produce mai
import { getFunctions, httpsCallable } from "firebase/functions";

// Sì
import { getApp } from "@firebase/app";
import { getFunctions, httpsCallable } from "@firebase/functions";
```

Lo stesso vale per `@firebase/firestore`, `@firebase/auth`, `@firebase/storage`,
`@firebase/analytics`, `@firebase/remote-config` e `@firebase/app-check`. Vengono installati insieme
a `firebase`; se il tuo package manager non li installa al livello principale (pnpm, per esempio),
aggiungi al tuo `package.json` quelli che importi.

`getApp()` restituisce l'app Firebase del tuo progetto, quella che usa FireCMS. FireCMS potrebbe non
averla ancora inizializzata quando il tuo codice viene caricato, quindi chiama `getApp()`,
`getFunctions()`, `getFirestore()` e simili quando il tuo codice viene eseguito, dentro un componente
o una callback, non al livello principale di un file.

## Risoluzione dei problemi

### "Error loading remote config"

FireCMS mostra questo messaggio quando non riesce a caricare o eseguire il codice che hai
distribuito. Apri la console del browser per vedere il motivo:

- **Un 404 su un file chiamato `__federation_shared_…`**, spesso seguito da un messaggio su un tipo
  MIME non consentito (`application/json`): il tuo codice importa un pacchetto condiviso tramite un
  altro percorso, di solito `firebase/…` invece di `@firebase/…`. Vedi
  [Importare Firebase nel tuo codice](#importare-firebase-nel-tuo-codice). Le versioni più recenti di `firecms deploy` se ne
  accorgono prima del caricamento e indicano gli import da cambiare.
- **Un'eccezione dal tuo codice**: qualcosa è fallito mentre la tua configurazione veniva caricata,
  per esempio una chiamata a `getFirestore()` al livello principale di un file prima che Firebase
  fosse inizializzato. Lo stack trace indica dove.

L'assenza di file `__federation_shared_…` in `dist/assets` è normale, non il segno di una build
rotta: FireCMS fornisce quei pacchetti, quindi la build non li include.

### Un 404 su `material-icons-….woff2`

Se la console mostra un 404 per `/assets/material-icons-….woff2` su `api.firecms.co`, le icone nel
tuo codice potrebbero non essere visualizzate. Il tuo `vite.config.ts` è precedente alla correzione
degli URL dei font nel template: copia il blocco `experimental.renderBuiltUrl` dal
[`vite.config.ts` del template di FireCMS Cloud](https://github.com/firecmsco/firecms/blob/main/packages/cli/templates/template_cloud/vite.config.ts) nel tuo, poi rifai la build e il deploy.

## Distribuzione

I progetti FireCMS Cloud possono essere distribuiti solo su FireCMS Cloud.

Se hai bisogno di una versione self-hosted di FireCMS, puoi usare il piano PRO, o usare la versione community.
Poiché le API sono le stesse per tutte le versioni, puoi facilmente passare dall'una all'altra.
