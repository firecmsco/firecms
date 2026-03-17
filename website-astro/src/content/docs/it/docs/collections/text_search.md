---
title: Ricerca testo
description: Aggiungi ricerca full-text a FireCMS con Typesense o Algolia. Usa la nostra Firebase Extension per una ricerca tollerante agli errori di battitura a ~$7/mese, o integra con Algolia per esigenze enterprise.
---

:::note[La soluzione descritta qui è specifica per Firestore]
Se stai sviluppando il tuo datasource, sei libero di implementare la ricerca testo nel modo che ha più senso.
:::

Firestore non supporta la ricerca testo nativa, quindi dobbiamo affidarci a soluzioni esterne. Se specifichi un flag `textSearchEnabled` alla **collezione**, vedrai una barra di ricerca in cima alla vista collezione.

## Opzioni di ricerca

| Opzione | Costo | Setup | Migliore per |
|--------|------|-------|------------|
| **Estensione Typesense** (Consigliato) | ~$7-14/mese flat | 5 min | La maggior parte dei progetti |
| **Algolia** | Prezzi per query | 15 min | Enterprise, geo-search |
| **Ricerca testo locale** | Gratuita | 1 min | Piccole collezioni (<1000 doc) |

---

## Usando Typesense (Consigliato)

L'**estensione FireCMS Typesense** distribuisce un server di ricerca Typesense su una VM di Compute Engine e sincronizza automaticamente i tuoi dati Firestore.

- 🔍 **Ricerca tollerante agli errori di battitura** - "headphnes" trova "headphones"
- ⚡ **Risposte in sub-millisecondi**
- 💰 **Costo mensile fisso** - Nessun addebito per query
- 🔄 **Sincronizzazione in tempo reale** - I documenti vengono indicizzati automaticamente

### Installazione

**Prerequisiti:**
- Progetto Firebase con Firestore
- Fatturazione GCP abilitata
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installato

**Passo 1: Installa l'estensione**

```bash
firebase ext:install https://github.com/firecmsco/typesense-extension --project=YOUR_PROJECT_ID
```

**Passo 2: Concedi i permessi**

```bash
export PROJECT_ID=your-project-id
export EXT_INSTANCE_ID=typesense-search  # Nome default estensione

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/compute.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/datastore.user" --condition=None
```

**Passo 3: Provisiona il server di ricerca**

```bash
curl "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-provisionSearchNode"
```

Attendi ~2 minuti. I documenti esistenti vengono indicizzati automaticamente.

### Uso di Typesense in FireCMS Cloud

Naviga in **Impostazioni progetto** e configura:

| Impostazione | Valore |
|---------|-------|
| **Regione** | La regione della tua estensione (es., `us-central1`) |
| **ID istanza estensione** | Default: `typesense-search` |

FireCMS Cloud si connette automaticamente alla tua istanza Typesense.

### Uso di Typesense in FireCMS Self-Hosted

```typescript
import { buildFireCMSSearchController, useFirestoreDelegate } from "@firecms/firebase";

const textSearchControllerBuilder = buildFireCMSSearchController({
  region: "us-central1",  // La regione della tua estensione
  extensionInstanceId: "typesense-search"  // Nome default
});

export function App() {
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
    textSearchControllerBuilder
  });
  // ... resto della tua app
}
```

---

## Usando Algolia

Algolia è un servizio di ricerca gestito con prezzi per query. Consigliato per esigenze enterprise o funzionalità avanzate come la geo-ricerca.

Devi definire un `FirestoreTextSearchControllerBuilder` e aggiungerlo alla tua configurazione. Configura un account Algolia e sincronizza i documenti usando la loro [estensione Firebase](https://extensions.dev/extensions/algolia/firestore-algolia-search).

### Uso di Algolia in FireCMS Cloud

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    buildExternalSearchController,
    FirestoreTextSearchController,
    buildCollection,
    FireCMSCloudApp,
    EntityCollectionsBuilder,
    FireCMSAppConfig
} from "@firecms/cloud";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products") {
            return performAlgoliaTextSearch(client, "products", searchString);
        }
        return undefined;
    }
});


const appConfig: FireCMSAppConfig = {
    version: "1",
    textSearchControllerBuilder: algoliaSearchController,
    // ...
}
```

### Uso di Algolia in FireCMS Self-Hosted

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import { buildExternalSearchController, performAlgoliaTextSearch } from "@firecms/firebase";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products")
            return performAlgoliaTextSearch(client, "products", searchString);
        return undefined;
    }
});


export function App() {

    // ...
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchControllerBuilder: algoliaSearchControllerBuilder
    });
    // ...
}

```


### Ricerca testo locale

Da FireCMS v3 forniamo un'implementazione di ricerca testo locale. Questo è utile per piccole collezioni o quando vuoi fornire un modo rapido per cercare nei tuoi dati.

Tuttavia, per collezioni più grandi, vorrai usare un provider di **ricerca esterno**, come Algolia. Questo è l'approccio consigliato.

Puoi usare la ricerca testo locale in FireCMS Cloud, o nelle versioni self-hosted.

Per FireCMS Cloud, devi solo abilitarla nell'UI.

Per le versioni self-hosted, puoi abilitarla impostando `localTextSearchEnabled` in `useFirestoreDelegate`.
Poi devi marcare ogni collezione con `textSearchEnabled: true`.

Se hai dichiarato un provider di indicizzazione esterno, la ricerca testo locale sarà efficace **solo per i percorsi non supportati dal provider esterno**.
