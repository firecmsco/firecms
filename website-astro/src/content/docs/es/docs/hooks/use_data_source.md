---
slug: es/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Acceda al hook de fuente de datos de FireCMS para obtener, guardar y gestionar entidades. Funciona con Firestore, MongoDB o cualquier implementación de backend personalizada.
---

Use este hook para acceder a la fuente de datos utilizada en su aplicación FireCMS.

Este controlador le permite obtener y guardar datos de su base de datos (como
Firestore o MongoDB) utilizando la abstracción de colecciones y entidades creada por FireCMS.

:::note
Tenga en cuenta que para usar este hook **debe** estar en
un componente (no puede usarlo directamente desde una función callback).
De todas formas, los callbacks generalmente incluyen un `FireCMSContext`, que contiene todos
los controladores incluyendo el `dataSource`.
:::

### Métodos disponibles

* `fetchCollection`: Obtener datos de una colección
* `listenCollection`: Escuchar entidades en una ruta dada con actualizaciones en tiempo real
* `fetchEntity`: Recuperar una entidad dado una ruta y un id
* `listenEntity`: Obtener actualizaciones en tiempo real de una entidad
* `saveEntity`: Guardar una entidad en la ruta especificada
* `deleteEntity`: Eliminar una entidad
* `checkUniqueField`: Verificar si el valor de la propiedad dada es único en la colección
* `generateEntityId`: Generar un nuevo ID para una entidad (opcional, depende de la implementación)

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
