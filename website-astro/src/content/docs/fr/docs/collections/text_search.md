---
title: Recherche textuelle
slug: fr/docs/collections/text_search
description: Ajoutez une recherche plein texte à FireCMS avec Typesense ou Algolia. Utilisez notre extension Firebase pour une recherche tolérante aux fautes à ~7$/mois, ou intégrez Algolia pour les besoins enterprise.
---

:::note[La solution décrite ici est spécifique à Firestore]
Si vous développez votre propre source de données, vous êtes libre d'implémenter la recherche textuelle de
la façon qui fait le plus sens.
:::

Firestore ne prend pas en charge la recherche textuelle native, nous devons donc nous appuyer sur des
solutions externes. Si vous spécifiez un indicateur `textSearchEnabled` pour la **collection**, vous
verrez une barre de recherche en haut de la vue de collection.

## Options de recherche

| Option | Coût | Installation | Idéal pour |
|--------|------|--------------|------------|
| **Extension Typesense** (Recommandé) | ~7-14$/mois forfait | 5 min | La plupart des projets |
| **Algolia** | Prix par requête | 15 min | Enterprise, géo-recherche |
| **Recherche locale** | Gratuit | 1 min | Petites collections (<1000 docs) |

---

## Utiliser Typesense (Recommandé)

L'**extension FireCMS Typesense** déploie un serveur de recherche Typesense sur une VM Compute Engine et synchronise automatiquement vos données Firestore. Fonctionnalités :

- 🔍 **Recherche tolérante aux fautes** - "casque" correspond à "csaque"
- ⚡ **Réponses en sous-milliseconde**
- 💰 **Coût mensuel forfaitaire** - Pas de frais par requête
- 🔄 **Synchronisation en temps réel** - Les documents sont auto-indexés à la création/mise à jour/suppression

### Installation

**Prérequis :**
- Projet Firebase avec Firestore
- Facturation GCP activée
- [CLI gcloud](https://cloud.google.com/sdk/docs/install) installé

**Étape 1 : Installer l'extension**

```bash
firebase ext:install https://github.com/firecmsco/typesense-extension --project=YOUR_PROJECT_ID
```

**Étape 2 : Accorder les permissions**

```bash
export PROJECT_ID=your-project-id
export EXT_INSTANCE_ID=typesense-search  # Nom d'extension par défaut

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

**Étape 3 : Provisionner le serveur de recherche**

```bash
curl "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-provisionSearchNode"
```

Remplacez `REGION` par votre région de fonctions (ex. `us-central1`) et `PROJECT_ID` par votre projet.

Attendez ~2 minutes. Les documents existants sont automatiquement indexés.

**Étape 4 : (Optionnel) Activer l'accès public à la recherche**

```bash
gcloud functions add-iam-policy-binding ext-${EXT_INSTANCE_ID}-api \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker" \
  --region=REGION \
  --project=${PROJECT_ID}
```

### Utiliser Typesense dans FireCMS Cloud

Allez dans **Paramètres du projet** et configurez :

| Paramètre | Valeur |
|-----------|--------|
| **Region** | La région de votre extension (ex. `us-central1`) |
| **Extension Instance ID** | Par défaut : `typesense-search` |

C'est tout ! FireCMS Cloud se connecte automatiquement à votre instance Typesense.

### Utiliser Typesense dans FireCMS auto-hébergé

```typescript
import { buildFireCMSSearchController, useFirestoreDelegate } from "@firecms/firebase";

const textSearchControllerBuilder = buildFireCMSSearchController({
  region: "us-central1",  // La région de votre extension
  extensionInstanceId: "typesense-search"  // Nom par défaut
});

export function App() {
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
    textSearchControllerBuilder
  });
  // ... reste de votre application
}
```

---

## Utiliser Algolia

Algolia est un service de recherche géré avec une tarification par requête. Idéal pour les besoins enterprise ou les fonctionnalités avancées comme la géo-recherche.

Vous devez définir un `FirestoreTextSearchControllerBuilder` et l'ajouter à votre configuration.
Configurez un compte Algolia et synchronisez les documents avec leur [extension Firebase](https://extensions.dev/extensions/algolia/firestore-algolia-search).

### Utiliser Algolia dans FireCMS Cloud

Nous fournissons une méthode utilitaire pour effectuer des recherches dans Algolia `performAlgoliaTextSearch`.
Vous devez importer la bibliothèque `algoliasearch` et créer un client Algolia.
Ensuite, vous pouvez utiliser la méthode `performAlgoliaTextSearch` pour effectuer la recherche.

Dans votre contrôleur, vous pouvez définir les chemins que vous souhaitez prendre en charge et la recherche.
Les chemins non spécifiés peuvent toujours être recherchés avec la recherche textuelle locale.

Exemple :

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";
import {
    performAlgoliaTextSearch,
    buildExternalSearchController,
    FireCMSAppConfig
} from "@firecms/cloud";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({ path, searchString }) => {
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

### Utiliser Algolia dans FireCMS auto-hébergé

Pour FireCMS auto-hébergé, vous devez définir un `FirestoreTextSearchControllerBuilder`.

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";
import { buildExternalSearchController, performAlgoliaTextSearch } from "@firecms/firebase";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({ path, searchString }) => {
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


### Recherche textuelle locale

Depuis FireCMS v3, nous fournissons une implémentation de recherche textuelle locale. C'est utile
pour les petites collections ou quand vous voulez fournir un moyen rapide de rechercher dans
vos données.

Cependant, pour les collections plus grandes, vous voudrez utiliser un fournisseur de **recherche externe**,
comme Algolia. C'est l'approche recommandée.

Vous pouvez utiliser la recherche textuelle locale dans FireCMS Cloud, ou dans les versions auto-hébergées.

Pour FireCMS Cloud, vous avez juste besoin de l'activer dans l'interface.

Pour les versions auto-hébergées, vous pouvez l'activer en définissant `localTextSearchEnabled` dans `useFirestoreDelegate`.
Ensuite, vous devez marquer chaque collection avec `textSearchEnabled: true`.

Si vous avez déclaré un fournisseur d'indexation externe, la recherche textuelle locale sera
effective **uniquement pour les chemins non pris en charge par le fournisseur externe**.
