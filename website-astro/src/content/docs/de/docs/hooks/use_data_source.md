---
title: useDataSource
sidebar_label: useDataSource
description: Hook für Zugriff auf die FireCMS-Datenquelle zum Abrufen, Speichern und Verwalten von Entities. Funktioniert mit Firestore, MongoDB oder einer benutzerdefinierten Backend-Implementierung.
---

Verwenden Sie diesen Hook, um auf die Datenquelle zuzugreifen, die in Ihrer FireCMS-Anwendung verwendet wird.

:::note
Bitte beachten Sie, dass Sie zur Verwendung dieses Hooks **in einer Komponente** sein müssen.
Callbacks beinhalten normalerweise einen `FireCMSContext`, der alle Controller einschließlich der `dataSource` enthält.
:::

### Verfügbare Methoden

* `fetchCollection`: Daten aus einer Kollektion abrufen
* `listenCollection`: Auf Entities in einem gegebenen Pfad mit Echtzeit-Updates hören
* `fetchEntity`: Eine Entity basierend auf einem Pfad und einer ID abrufen
* `listenEntity`: Echtzeit-Updates für eine Entity erhalten
* `saveEntity`: Eine Entity im angegebenen Pfad speichern
* `deleteEntity`: Eine Entity löschen
* `checkUniqueField`: Prüfen ob ein Eigenschaftswert in der Kollektion eindeutig ist
* `generateEntityId`: Eine neue ID für eine Entity generieren (optional, implementierungsabhängig)

### Beispiel

```tsx
import React, { useEffect, useState } from "react";
import { useDataSource, Entity } from "@firecms/core";

type Product = {
    name: string;
    price: number;
};

export function ProductList() {
    const dataSource = useDataSource();
    const [products, setProducts] = useState<Entity<Product>[]>([]);

    useEffect(() => {
        dataSource.fetchCollection<Product>({
            path: "products"
        }).then(entities => {
            setProducts(entities);
        });
    }, []);

    return (
        <ul>
            {products.map(product => (
                <li key={product.id}>{product.values.name}</li>
            ))}
        </ul>
    );
}
```
