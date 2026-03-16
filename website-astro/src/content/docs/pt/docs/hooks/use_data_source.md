---
slug: pt/docs/hooks/use_data_source
title: useDataSource
sidebar_label: useDataSource
description: Acesse o hook de fonte de dados do FireCMS para buscar, salvar e gerenciar entidades. Funciona com Firestore, MongoDB ou qualquer implementação de backend personalizada.
---

Utilize este hook para acessar a fonte de dados sendo usada na sua aplicação FireCMS.

Este controlador permite buscar e salvar dados do seu banco de dados (como
Firestore ou MongoDB) usando a abstração de coleções e entidades criada pelo FireCMS.

:::note
Note que para utilizar este hook, você **deve** estar em um
componente (não pode utilizá-lo diretamente de uma função callback).
De qualquer forma, callbacks geralmente incluem um `FireCMSContext`, que inclui todos
os controladores incluindo o `dataSource`.
:::

### Métodos disponíveis

* `fetchCollection`: Buscar dados de uma coleção
* `listenCollection`: Escutar entidades em um caminho dado com atualizações em tempo real
* `fetchEntity`: Recuperar uma entidade dado um caminho e um id
* `listenEntity`: Obter atualizações em tempo real de uma entidade
* `saveEntity`: Salvar uma entidade no caminho especificado
* `deleteEntity`: Deletar uma entidade
* `checkUniqueField`: Verificar se o valor da propriedade dada é único na coleção
* `generateEntityId`: Gerar um novo ID para uma entidade (opcional, dependente da implementação)

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
