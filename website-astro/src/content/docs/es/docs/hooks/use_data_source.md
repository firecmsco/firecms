---
slug: es/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Accede al hook de fuente de datos de FireCMS para obtener, guardar y gestionar entidades. Compatible con Firestore, MongoDB o cualquier implementación de backend personalizada.
---

Usa este hook para acceder a la fuente de datos utilizada en tu aplicación FireCMS.

Este controlador te permite obtener y guardar datos de tu base de datos (como
Firestore o MongoDB) usando la abstracción de colecciones y entidades creada por FireCMS.

:::note
Ten en cuenta que para usar este hook **debes** estar en
un componente (no puedes usarlo directamente desde una función de callback).
De todos modos, los callbacks normalmente incluyen un `FireCMSContext`, que contiene todos
los controladores incluyendo el `dataSource`.
:::

### Métodos Disponibles

* `fetchCollection`: Obtiene datos de una colección
* `listenCollection`: Escucha entidades en una ruta dada con actualizaciones en tiempo real
* `fetchEntity`: Recupera una entidad dada una ruta y un id
* `listenEntity`: Obtiene actualizaciones en tiempo real de una entidad
* `saveEntity`: Guarda una entidad en la ruta especificada
* `deleteEntity`: Elimina una entidad
* `checkUniqueField`: Verifica si el valor de la propiedad dado es único en la colección
* `generateEntityId`: Genera un nuevo ID para una entidad (opcional, depende de la implementación)

### Ejemplo

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
