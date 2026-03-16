---
slug: fr/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Accédez au hook de source de données FireCMS pour récupérer, enregistrer et gérer les entités. Fonctionne avec Firestore, MongoDB ou toute implémentation backend personnalisée.
---

Utilisez ce hook pour accéder à la source de données utilisée dans votre application FireCMS.

Ce contrôleur vous permet de récupérer et d'enregistrer des données depuis votre base de données (comme
Firestore ou MongoDB) en utilisant l'abstraction des collections et entités créée par FireCMS.

:::note
Veuillez noter que pour utiliser ce hook, vous **devez** être dans
un composant (vous ne pouvez pas l'utiliser directement depuis une fonction callback).
Quoi qu'il en soit, les callbacks incluent généralement un `FireCMSContext`, qui comprend tous
les contrôleurs y compris le `dataSource`.
:::

### Méthodes disponibles

* `fetchCollection` : Récupérer des données d'une collection
* `listenCollection` : Écouter les entités d'un chemin donné avec des mises à jour en temps réel
* `fetchEntity` : Récupérer une entité à partir d'un chemin et d'un id
* `listenEntity` : Obtenir des mises à jour en temps réel sur une entité
* `saveEntity` : Enregistrer une entité dans le chemin spécifié
* `deleteEntity` : Supprimer une entité
* `checkUniqueField` : Vérifier si la valeur de la propriété donnée est unique dans la collection
* `generateEntityId` : Générer un nouvel ID pour une entité (optionnel, dépendant de l'implémentation)

### Exemple

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
