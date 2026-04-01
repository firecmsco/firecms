---
slug: it/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Accedi all'hook della fonte dati di FireCMS per recuperare, salvare e gestire le entità. Funziona con Firestore, MongoDB o qualsiasi implementazione backend personalizzata.
---

Usa questo hook per accedere alla fonte dati utilizzata nella tua applicazione FireCMS.

Questo controller ti permette di recuperare e salvare dati dal tuo database (come
Firestore o MongoDB) utilizzando l'astrazione di collezioni ed entità creata da FireCMS.

:::note
Tieni presente che per utilizzare questo hook **devi** essere all'interno
di un componente (non puoi usarlo direttamente da una funzione callback).
Tuttavia, i callback di solito includono un `FireCMSContext`, che contiene tutti
i controller incluso il `dataSource`.
:::

### Metodi disponibili

* `fetchCollection`: Recuperare dati da una collezione
* `listenCollection`: Ascoltare le entità in un percorso dato con aggiornamenti in tempo reale
* `fetchEntity`: Recuperare un'entità dato un percorso e un id
* `listenEntity`: Ottenere aggiornamenti in tempo reale su un'entità
* `saveEntity`: Salvare un'entità nel percorso specificato
* `deleteEntity`: Eliminare un'entità
* `checkUniqueField`: Verificare se il valore della proprietà è unico nella collezione
* `generateEntityId`: Generare un nuovo ID per un'entità (opzionale, dipende dall'implementazione)

### Esempio

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
