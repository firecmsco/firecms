---
slug: de/docs/collections/text_search
title: Textsuche
description: Fügen Sie FireCMS Volltextsuche mit Typesense oder Algolia hinzu. Verwenden Sie unsere Firebase-Erweiterung für tippfehlertolerante Suche ab ~7$/Monat oder integrieren Sie Algolia für Unternehmensbedürfnisse.
---

:::note[Die hier beschriebene Lösung ist spezifisch für Firestore]
Wenn Sie Ihre eigene Datenquelle entwickeln, können Sie die Textsuche
beliebig implementieren.
:::

Firestore unterstützt keine native Textsuche, daher müssen wir auf externe
Lösungen zurückgreifen. Wenn Sie ein `textSearchEnabled`-Flag für eine **Kollektion** angeben,
sehen Sie eine Suchleiste oben in der Kollektionsansicht.

## Suchoptionen

| Option | Kosten | Einrichtung | Am besten für |
|--------|------|-------|------------|
| **Typesense-Erweiterung** (Empfohlen) | ~7-14$/Monat pauschal | 5 Min | Die meisten Projekte |
| **Algolia** | Pro-Abfrage-Preisgestaltung | 15 Min | Enterprise, Geo-Suche |
| **Lokale Textsuche** | Kostenlos | 1 Min | Kleine Kollektionen (<1000 Docs) |

---

## Typesense verwenden (Empfohlen)

Die **FireCMS Typesense-Erweiterung** stellt einen Typesense-Suchserver auf einer Compute Engine VM bereit und synchronisiert Ihre Firestore-Daten automatisch.

- 🔍 **Tippfehlertolerante Suche** — „headphnes" findet „headphones"
- ⚡ **Antworten unter einer Millisekunde**
- 💰 **Pauschalmonatliche Kosten** — Keine Pro-Abfrage-Gebühren
- 🔄 **Echtzeit-Synchronisation** — Dokumente werden bei Erstellen/Aktualisieren/Löschen automatisch indiziert

### Installation

**Voraussetzungen:**
- Firebase-Projekt mit Firestore
- GCP-Abrechnung aktiviert
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installiert

**Schritt 1: Erweiterung installieren**

```bash
firebase ext:install https://github.com/firecmsco/typesense-extension --project=YOUR_PROJECT_ID
```

**Schritt 2: Berechtigungen gewähren**

```bash
export PROJECT_ID=your-project-id
export EXT_INSTANCE_ID=typesense-search  # Standardname der Erweiterung

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

**Schritt 3: Suchserver bereitstellen**

```bash
curl "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-provisionSearchNode"
```

Ersetzen Sie `REGION` durch Ihre Funktionsregion (z.B. `us-central1`) und `PROJECT_ID` durch Ihr Projekt.

Warten Sie ~2 Minuten. Vorhandene Dokumente werden automatisch indiziert.

**Schritt 4: (Optional) Öffentlichen Suchzugang aktivieren**

```bash
gcloud functions add-iam-policy-binding ext-${EXT_INSTANCE_ID}-api \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker" \
  --region=REGION \
  --project=${PROJECT_ID}
```

### Typesense in FireCMS Cloud verwenden

Navigieren Sie zu **Projekteinstellungen** und konfigurieren Sie:

| Einstellung | Wert |
|---------|-------|
| **Region** | Region Ihrer Erweiterung (z.B. `us-central1`) |
| **Erweiterungs-Instanz-ID** | Standard: `typesense-search` |

Das war's! FireCMS Cloud verbindet sich automatisch mit Ihrer Typesense-Instanz.

### Typesense in Self-Hosted FireCMS verwenden

```typescript
import { buildFireCMSSearchController, useFirestoreDelegate } from "@firecms/firebase";

const textSearchControllerBuilder = buildFireCMSSearchController({
  region: "us-central1",  // Region Ihrer Erweiterung
  extensionInstanceId: "typesense-search"  // Standardname
});

export function App() {
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
    textSearchControllerBuilder
  });
  // ... Rest Ihrer App
}
```

---

## Algolia verwenden

Algolia ist ein verwalteter Suchdienst mit Pro-Abfrage-Preisgestaltung.

### Algolia in FireCMS Cloud verwenden

Wir bieten eine Hilfsmethode zum Durchführen von Suchen in Algolia: `performAlgoliaTextSearch`.

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    buildExternalSearchController,
    FireCMSCloudApp,
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

### Algolia in Self-Hosted FireCMS verwenden

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
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchControllerBuilder: algoliaSearchController
    });
    // ...
}
```

### Lokale Textsuche

Seit FireCMS v3 bieten wir eine lokale Textsuche an. Dies ist nützlich
für kleine Kollektionen oder wenn Sie eine schnelle Möglichkeit zum Durchsuchen Ihrer Daten bieten möchten.

Bei größeren Kollektionen sollten Sie einen **externen Suchanbieter** wie Algolia verwenden.

Für FireCMS Cloud müssen Sie sie einfach in der UI aktivieren.

Für Self-Hosted-Versionen können Sie sie aktivieren, indem Sie `localTextSearchEnabled` in `useFirestoreDelegate` setzen
und jede Kollektion mit `textSearchEnabled: true` markieren.
