---
title: "Distribuzione del tuo CMS Firebase e pannello admin"
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

## Distribuzione

I progetti FireCMS Cloud possono essere distribuiti solo su FireCMS Cloud.

Se hai bisogno di una versione self-hosted di FireCMS, puoi usare il piano PRO, o usare la versione community.
Poiché le API sono le stesse per tutte le versioni, puoi facilmente passare dall'una all'altra.
