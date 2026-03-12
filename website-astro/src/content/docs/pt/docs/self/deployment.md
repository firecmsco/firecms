---
slug: pt/docs/self/deployment
title: Distribuzione self-hosted
sidebar_label: Distribuzione
description: Distribuisci il tuo CMS personalizzato self-hosted su Firebase Hosting o qualsiasi altro provider di hosting statico.
---

FireCMS funziona come **CMS headless** su Firebase. Si build come una **single page application** che può essere distribuita su qualsiasi provider di hosting statico. Non richiede codice lato server.

Raccomandiamo di distribuire su Firebase Hosting, poiché si trova nello stesso ecosistema e FireCMS raccoglierà automaticamente la configurazione Firebase dall'ambiente.


## Distribuzione su Firebase Hosting

Se vuoi distribuire il tuo CMS su Firebase Hosting, devi prima abilitarlo nella scheda Hosting del tuo progetto Firebase.

Dovrai inizializzare Firebase, con un progetto esistente o uno nuovo:

```
firebase init
```

:::note
Non è necessario abilitare nessuno dei servizi, tranne Firebase Hosting se vuoi distribuirlo lì.
:::

Puoi collegare il sito Firebase Hosting all'app web che hai creato per ottenere la tua configurazione Firebase.

Per far funzionare tutto correttamente, devi configurare i redirect di Firebase Hosting per funzionare come SPA. Il tuo **firebase.json** dovrebbe essere simile a questo (ricorda di sostituire `[YOUR_SITE_HERE]`).

```json5
{
  "hosting": {
    "site": "[YOUR_SITE_HERE]",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

```

Poi esegui semplicemente:

```bash
npm run build && firebase deploy --only hosting
```

o

```bash
yarn run build && firebase deploy --only hosting
```

## Distribuire su altre piattaforme

Se vuoi distribuire il tuo CMS su altre piattaforme, puoi fare il build con:

```
yarn run build
```

e poi servire la cartella **dist** con il tuo provider di hosting statico preferito.
