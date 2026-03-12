---
slug: it/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Hook per accedere alla sorgente dati di FireCMS per recuperare, salvare e gestire entità. Funziona con Firestore, MongoDB o qualsiasi implementazione backend personalizzata.
---

Usa questo hook per accedere alla sorgente dati utilizzata nella tua applicazione FireCMS.

Questo controller ti permette di recuperare e salvare dati dal tuo database (come
Firestore o MongoDB) usando l'astrazione di collezioni ed entità creata da FireCMS.

:::note
Tieni presente che per usare questo hook **devi** essere in
un componente (non puoi usarlo direttamente da una funzione di callback).
In ogni caso, i callback di solito includono un `FireCMSContext`, che contiene tutti
i controller incluso il `dataSource`.
:::

### Metodi disponibili

* `fetchCollection`: Recupera dati da una collezione
* `listenCollection`: Ascolta le entità in un percorso con aggiornamenti in tempo reale
* `fetchEntity`: Recupera un'entità dato un percorso e un id
* `listenEntity`: Ricevi aggiornamenti in tempo reale su una singola entità
* `saveEntity`: Salva un'entità nel percorso specificato
* `deleteEntity`: Elimina un'entità
* `checkUniqueField`: Controlla se il valore della proprietà è univoco nella collezione
* `generateEntityId`: Genera un nuovo ID per un'entità (opzionale, dipende dall'implementazione)

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
