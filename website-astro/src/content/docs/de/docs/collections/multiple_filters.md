---
title: Mehrere Filter in Kollektionsansichten
sidebar_label: Mehrere Filter
---

Firestore ist etwas eingeschränkt beim Filtern und Sortieren – standardmäßig auf eine einzige `where`-Klausel pro Abfrage begrenzt.
Das bedeutet, dass das Filtern nach mehreren Feldern nicht von Haus aus möglich ist. Dies ist eine Einschränkung von Firestore, nicht von
FireCMS.

:::important
Seit FireCMS 3.0 versucht FireCMS, Ihre Abfrage trotzdem auszuführen, wenn Sie keine Indexes manuell definieren. Wenn sie fehlschlägt,
wird ein Link zur Firestore-Konsole angezeigt, um die erforderlichen Indexes zu erstellen.
:::

Wenn Sie die UI-Operationen einschränken möchten, die in einer Kollektion ausgeführt werden können, basierend auf Ihren vorhandenen Indexes, können Sie
diese in FireCMS definieren, indem Sie einen `FirestoreIndexesBuilder` verwenden. Dies ist ein Builder, mit dem Sie Ihre Firestore-Indexes deklarieren können.
Wenn Sie Ihre Indexes definieren, erlaubt FireCMS Ihnen nur, nach den Feldern zu filtern, die Sie definiert haben, oder den Feldern, die
ohne Indexes gefiltert und sortiert werden können.

:::note
Firestore und FireCMS erlauben bestimmte Abfragen ohne Indexes, diese sind jedoch begrenzt.
Sie können zum Beispiel nach einem einzelnen Feld filtern, oder nach mehreren Feldern, wenn Sie
nach Gleichheit filtern (aber nicht andere Operatoren wie `>`, `<`, `>=`, `<=`).
Prüfen Sie die [Firestore-Dokumentation](https://firebase.google.com/docs/firestore/query-data/indexing)
:::


Dies ist ein Beispiel, wie Sie einen `FirestoreIndexesBuilder` definieren können.
Sie können dann ein Array von Indexes zurückgeben, das für die Filterung der Kollektion verwendet wird.

```tsx
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Beispiel-Index-Builder, der die Filterung nach `category` und `available` für die `products`-Kollektion erlaubt
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // Für 2 Felder müssen Sie 4 Indexes definieren (ich weiß...)
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


## Ihre Indexes in Self-Hosted FireCMS hinzufügen

```tsx
import { FirestoreIndexesBuilder, useFirestoreDelegate } from "@firecms/firebase";

// ...

    // Beispiel-Index-Builder, der die Filterung nach `category` und `available` für die `products`-Kollektion erlaubt
    const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
        if (path === "products") {
            // Für 2 Felder müssen Sie 4 Indexes definieren (ich weiß...)
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

    // Delegate für das Abrufen und Speichern von Daten in Firestore
    const firestoreDelegate = useFirestoreDelegate({
        // ...
        firestoreIndexesBuilder
    });
    
    // ...
```


## Ihre Indexes in FireCMS Cloud hinzufügen

```tsx
import { FireCMSCloudApp } from "@firecms/cloud";
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Beispiel-Index-Builder, der die Filterung nach `category` und `available` für die `products`-Kollektion erlaubt
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // Für 2 Felder müssen Sie 4 Indexes definieren (ich weiß...)
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

// Fügen Sie Ihren Index-Builder zur App hinzu
function MyApp() {

    return <FireCMSCloudApp
        // ...
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        // ...
    />;
}
```
