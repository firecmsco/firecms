---
slug: de/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Zugriff auf den FireCMS-Datenquellen-Hook zum Abrufen, Speichern und Verwalten von Entitäten. Funktioniert mit Firestore, MongoDB oder jeder benutzerdefinierten Backend-Implementierung.
---

Verwenden Sie diesen Hook, um auf die Datenquelle zuzugreifen, die in Ihrer FireCMS-Anwendung verwendet wird.

Dieser Controller ermöglicht es Ihnen, Daten aus Ihrer Datenbank (wie
Firestore oder MongoDB) abzurufen und zu speichern, wobei die von FireCMS erstellte Abstraktion von Sammlungen und Entitäten verwendet wird.

:::note
Bitte beachten Sie, dass Sie diesen Hook **nur** innerhalb
einer Komponente verwenden können (Sie können ihn nicht direkt in einer Callback-Funktion verwenden).
Callbacks enthalten in der Regel jedoch einen `FireCMSContext`, der alle
Controller einschließlich der `dataSource` enthält.
:::

### Verfügbare Methoden

* `fetchCollection`: Daten aus einer Sammlung abrufen
* `listenCollection`: Entitäten in einem bestimmten Pfad mit Echtzeit-Updates abhören
* `fetchEntity`: Eine Entität anhand eines Pfads und einer ID abrufen
* `listenEntity`: Echtzeit-Updates für eine Entität erhalten
* `saveEntity`: Eine Entität im angegebenen Pfad speichern
* `deleteEntity`: Eine Entität löschen
* `checkUniqueField`: Prüfen, ob der angegebene Eigenschaftswert in der Sammlung einzigartig ist
* `generateEntityId`: Eine neue ID für eine Entität generieren (optional, implementierungsabhängig)

### Beispiel

```tsx
import React, { useEffect, useState } from "react";
import { useDataSource, Entity } from "@firecms/core";

type Product = {
    name: string;
    price: number;
};

export function ProductLoader() {
    const dataSource = useDataSource();
    const [products, setProducts] = useState<Entity<Product>[]>([]);

    useEffect(() => {
        dataSource.fetchCollection<Product>({
            path: "products",
            limit: 10
        }).then(setProducts);
    }, [dataSource]);

    return (
        <div>
            {products.map(product => (
                <div key={product.id}>{product.values.name}</div>
            ))}
        </div>
    );
}
```
