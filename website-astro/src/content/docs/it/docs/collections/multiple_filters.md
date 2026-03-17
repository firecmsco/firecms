---
title: Filtri multipli nelle viste collezione
sidebar_label: Filtri multipli
---

Firestore ha alcune limitazioni con il filtraggio e l'ordinamento, limitato a una singola clausola `where` per query per impostazione predefinita. Questo significa che filtrare per più campi non è possibile di base. Questa è una limitazione di Firestore, non di FireCMS.

:::important
Da FireCMS 3.0, se non definisci gli indici manualmente, FireCMS tenterà comunque di eseguire la tua query; se fallisce, mostrerà un link alla console Firestore per creare gli indici richiesti.
:::

Se vuoi limitare le operazioni UI che possono essere eseguite in una collezione, in base ai tuoi indici esistenti, puoi definirli in FireCMS, usando un `FirestoreIndexesBuilder`. Questo è un builder che ti permette di dichiarare i tuoi indici Firestore.
Se definisci i tuoi indici, FireCMS ti permetterà solo di filtrare per i campi che hai definito, o i campi che possono essere filtrati e ordinati senza indici.

:::note
Firestore e FireCMS consentono alcune query senza indici, ma sono limitate.
Ad esempio, puoi filtrare per un singolo campo, o per più campi se stai
filtrando per uguaglianza (ma non altri operatori come `>`, `<`, `>=`, `<=`).
Controlla la [documentazione Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
:::


Questo è un esempio di come puoi definire un `FirestoreIndexesBuilder`. Puoi poi restituire un array di indici che verranno usati per filtrare la collezione.

```tsx
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Builder di indici che consente il filtraggio per `category` e `available` per la collezione `products`
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // Per 2 campi, devi definire 4 indici (lo so...)
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


## Aggiungere i tuoi indici in FireCMS self-hosted

```tsx
import { FirestoreIndexesBuilder, useFirestoreDelegate } from "@firecms/firebase";

// ...

    // Builder di indici di esempio
    const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
        if (path === "products") {
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

    // Delegato usato per recuperare e salvare dati in Firestore
    const firestoreDelegate = useFirestoreDelegate({
        // ...
        firestoreIndexesBuilder
    });
    
    // ...
```


## Aggiungere i tuoi indici in FireCMS Cloud

```tsx
import { FireCMSCloudApp } from "@firecms/cloud";
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Builder di indici di esempio
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
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

// Aggiunge il tuo builder di indici alla tua app
function MyApp() {

    return <FireCMSCloudApp
        // ...
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        // ...
    />;
}
```
