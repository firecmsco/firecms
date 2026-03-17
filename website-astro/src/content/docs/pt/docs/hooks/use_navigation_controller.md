---
title: useNavigationController
sidebar_label: useNavigationController
description: Acesse o controlador de navegação do FireCMS para gerenciar coleções e rotas programaticamente.
---

Utilize este hook para acessar o controlador de navegação. Ele permite navegar programaticamente e acessar as coleções e vistas registradas.

:::note
Note que para utilizar este hook, você **deve** estar em um componente filho do `FireCMS`.
:::

### Métodos disponíveis

* `collections`: Coleções registradas no sistema
* `getCollection`: Obter uma coleção dado seu caminho
* `isUrlCollectionPath`: Verificar se um URL corresponde a um caminho de coleção
* `urlPathToDataPath`: Converter um caminho URL em um caminho de dados
* `buildUrlCollectionPath`: Construir um caminho URL para uma coleção

### Exemplo

```tsx
import React from "react";
import { useNavigationController } from "@firecms/core";

export function CollectionsList() {
    const navigationController = useNavigationController();

    return (
        <div>
            {navigationController.collections?.map(collection => (
                <div key={collection.id}>{collection.name}</div>
            ))}
        </div>
    );
}
```
