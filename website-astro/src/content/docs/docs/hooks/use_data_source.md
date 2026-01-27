---
slug: docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Access the FireCMS data source hook for fetching, saving, and managing entities. Works with Firestore, MongoDB, or any custom backend implementation.
---

Use this hook to access the data source being used in your FireCMS application.

This controller allows you to fetch and save data from your database (such
as Firestore or MongoDB) using the abstraction of collections and entities created by FireCMS.

:::note
Please note that in order to use this hook you **must** be in
a component (you can't use it directly from a callback function).
Anyhow, callbacks usually include a `FireCMSContext`, which includes all
the controllers including the `dataSource`.
:::

### Available Methods

* `fetchCollection`: Fetch data from a collection
* `listenCollection`: Listen to entities in a given path with real-time updates
* `fetchEntity`: Retrieve an entity given a path and an id
* `listenEntity`: Get real-time updates on one entity
* `saveEntity`: Save an entity to the specified path
* `deleteEntity`: Delete an entity
* `checkUniqueField`: Check if the given property value is unique in the collection
* `generateEntityId`: Generate a new ID for an entity (optional, implementation dependent)

### Example

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
