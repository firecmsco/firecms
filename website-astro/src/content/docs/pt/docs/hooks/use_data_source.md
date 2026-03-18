---
slug: pt/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Acesse o hook de fonte de dados do FireCMS para buscar, salvar e gerenciar entidades. Funciona com Firestore, MongoDB ou qualquer implementação de backend personalizada.
---

Use este hook para acessar a fonte de dados utilizada na sua aplicação FireCMS.

Este controlador permite buscar e salvar dados do seu banco de dados (como
Firestore ou MongoDB) usando a abstração de coleções e entidades criada pelo FireCMS.

:::note
Observe que para usar este hook você **deve** estar dentro
de um componente (não é possível usá-lo diretamente em uma função callback).
No entanto, os callbacks geralmente incluem um `FireCMSContext`, que contém todos
os controladores incluindo o `dataSource`.
:::

### Métodos disponíveis

* `fetchCollection`: Buscar dados de uma coleção
* `listenCollection`: Ouvir entidades em um caminho dado com atualizações em tempo real
* `fetchEntity`: Recuperar uma entidade dado um caminho e um id
* `listenEntity`: Obter atualizações em tempo real de uma entidade
* `saveEntity`: Salvar uma entidade no caminho especificado
* `deleteEntity`: Excluir uma entidade
* `checkUniqueField`: Verificar se o valor da propriedade é único na coleção
* `generateEntityId`: Gerar um novo ID para uma entidade (opcional, depende da implementação)

### Exemplo

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
