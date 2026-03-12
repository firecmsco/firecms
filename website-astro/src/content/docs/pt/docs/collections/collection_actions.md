---
slug: pt/docs/collections/collection_actions
title: Ações da Barra de Coleção
sidebar_label: Ações da Barra de Coleção
---


![collection_actions](/img/collection_actions.png)

Você pode adicionar componentes personalizados à barra da coleção.

Isso é útil para adicionar ações específicas à coleção com a qual você está trabalhando.

Por exemplo, você poderia adicionar um botão para exportar os **dados selecionados**, ou um botão para acionar uma **ação específica no seu backend**.

Você também pode recuperar os **filtros selecionados** e modificá-los.

### Exemplo recuperando entidades selecionadas

Você precisa definir um componente que recebe `CollectionActionsProps` como props.

```tsx
import React from "react";
import { CollectionActionsProps, useSnackbarController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function SampleCollectionActions({ selectionController }: CollectionActionsProps) {

    const snackbarController = useSnackbarController();

    const onClick = (event: React.MouseEvent) => {
        const selectedEntities = selectionController?.selectedEntities;
        const count = selectedEntities ? selectedEntities.length : 0;
        snackbarController.open({
            type: "success",
            message: `Código definido pelo usuário aqui! ${count} produtos selecionados`
        });
    };

    return (
        <Button onClick={onClick}
                color="primary"
                variant={"text"}>
            Minha ação personalizada
        </Button>
    );

}
```

depois basta adicioná-lo à sua configuração de coleção:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { SampleCollectionActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: SampleCollectionActions,
    // ...
});
```


### Exemplo modificando filtros

Este é um exemplo de como você pode modificar os filtros na barra de coleção:

```tsx
import React from "react";
import { CollectionActionsProps } from "@firecms/core";
import { CloseIcon, IconButton, Select, SelectItem } from "@firecms/ui";

export function CustomFiltersActions({
                                         tableController
                                     }: CollectionActionsProps) {

    const filterValues = tableController.filterValues;
    const categoryFilter = filterValues?.category;
    const categoryFilterValue = categoryFilter?.[1];

    const updateFilter = (value: string | null) => {
        const newFilter = {
            ...filterValues
        };
        if (value) {
            newFilter.category = ["==", value];
        } else {
            delete newFilter.category;
        }
        tableController.setFilterValues?.(newFilter);
    };

    return (
        <Select placeholder={"Filtro de categoria"}
                className={"w-44"}
                endAdornment={categoryFilterValue ?
                    <IconButton size={"small"} onClick={() => updateFilter(null)}>
                        <CloseIcon size={"smallest"}/>
                    </IconButton> : undefined}
                onValueChange={updateFilter}
                size={"small"}
                value={categoryFilterValue}>
            <SelectItem value="cameras">Cameras</SelectItem>
            <SelectItem value="bath">Bath</SelectItem>
        </Select>
    );

}

```

depois basta adicioná-lo à sua configuração de coleção:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { CustomFiltersActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: CustomFiltersActions,
    // ...
});
```


## CollectionActionsProps

As seguintes propriedades estão disponíveis na interface `CollectionActionsProps`:

- **`path`**: Caminho completo da coleção desta entidade. Este é o caminho completo, como `users/1234/addresses`.

- **`relativePath`**: Caminho da última coleção, como `addresses`.

- **`parentCollectionIds`**: Array dos segmentos de caminho pai como `['users']`.

- **`collection`**: A configuração da coleção.

- **`selectionController`**: Use este controller para obter as entidades selecionadas e atualizar o estado de entidades selecionadas.

- **`tableController`**: Use este controller para obter o controller de tabela e atualizar o estado do controller de tabela.

- **`context`**: Contexto do status do app.

- **`collectionEntitiesCount`**: Contagem das entidades nesta coleção.
