---
title: Filtres multiples dans les vues de collection
sidebar_label: Filtres multiples
---

Firestore est un peu limité lors du filtrage et du tri, limité à une seule clause `where` par requête par défaut.
Cela signifie que le filtrage par plusieurs champs n'est pas possible nativement. Il s'agit d'une limitation de Firestore, pas de FireCMS.

:::important
Depuis FireCMS 3.0, si vous ne définissez pas les indexes manuellement, FireCMS tentera quand même d'exécuter votre requête. En cas d'échec,
il affichera un lien vers la console Firestore pour créer les indexes requis.
:::

Si vous voulez restreindre les opérations UI pouvant être effectuées dans une collection, en fonction de vos indexes existants, vous pouvez
les définir dans FireCMS, en utilisant un `FirestoreIndexesBuilder`. C'est un constructeur qui vous permet de déclarer vos indexes Firestore.
Si vous définissez vos indexes, FireCMS ne vous permettra de filtrer que par les champs que vous avez définis, ou les champs pouvant
être filtrés et triés sans indexes.

:::note
Firestore et FireCMS permettent certaines requêtes sans indexes, mais elles sont limitées.
Par exemple, vous pouvez filtrer par un seul champ, ou par plusieurs champs si vous
filtrez par égalité (mais pas d'autres opérateurs comme `>`, `<`, `>=`, `<=`).
Consultez la [documentation Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
:::


Voici un exemple de définition d'un `FirestoreIndexesBuilder`.
Vous pouvez ensuite retourner un tableau d'indexes qui seront utilisés pour filtrer la collection.

```tsx
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Exemple de constructeur d'indexes permettant le filtrage par `category` et `available` pour la collection `products`
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // Pour 2 champs, vous devez définir 4 indexes (je sais...)
        return [
            {
                category: "asc",
                available: "desc"
            },
            {
                category: "asc",
                available: "asc"
            },
            {
                category: "desc",
                available: "desc"
            },
            {
                category: "desc",
                available: "asc"
            }
        ];
    }
    return undefined;
}

```


## Ajouter vos indexes dans FireCMS auto-hébergé

```tsx
import { FirestoreIndexesBuilder, useFirestoreDelegate } from "@firecms/firebase";

// ...

    // Exemple de constructeur d'indexes permettant le filtrage par `category` et `available` pour la collection `products`
    const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
        if (path === "products") {
            // Pour 2 champs, vous devez définir 4 indexes (je sais...)
            return [
                {
                    category: "asc",
                    available: "desc"
                },
                {
                    category: "asc",
                    available: "asc"
                },
                {
                    category: "desc",
                    available: "desc"
                },
                {
                    category: "desc",
                    available: "asc"
                }
            ];
        }
        return undefined;
    }

    // Délégué utilisé pour récupérer et sauvegarder des données dans Firestore
    const firestoreDelegate = useFirestoreDelegate({
        // ...
        firestoreIndexesBuilder
    });
    
    // ...
```


## Ajouter vos indexes dans FireCMS Cloud

```tsx
import { FireCMSCloudApp } from "@firecms/cloud";
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Exemple de constructeur d'indexes permettant le filtrage par `category` et `available` pour la collection `products`
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // Pour 2 champs, vous devez définir 4 indexes (je sais...)
        return [
            {
                category: "asc",
                available: "desc"
            },
            {
                category: "asc",
                available: "asc"
            },
            {
                category: "desc",
                available: "desc"
            },
            {
                category: "desc",
                available: "asc"
            }
        ];
    }
    return undefined;
}

// Ajoutez votre constructeur d'indexes à votre application
function MyApp() {

    return <FireCMSCloudApp
        // ...
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        // ...
    />;
}
```
