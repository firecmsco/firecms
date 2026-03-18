---
slug: pt/docs/hooks/use_reference_dialog
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note
Observe que para usar este hook você **deve** estar dentro de um
componente (não é possível usá-lo diretamente em uma função callback).
:::

## `useReferenceDialog`

Este hook é utilizado para abrir um diálogo lateral que permite a seleção de entidades
sob um dado caminho. Você pode usá-lo em visualizações personalizadas para selecionar entidades.
Você precisa especificar pelo menos o caminho da coleção de destino. Se sua coleção
não está definida na configuração principal de coleções
(no seu componente `FireCMS`), você precisa especificá-la explicitamente. Este é o mesmo
hook utilizado internamente quando uma propriedade de referência é definida.

As propriedades fornecidas por este hook são:

*     multiselect?: boolean;
  Permitir seleção múltipla de valores

*     collection?: EntityCollection;
  Configuração da coleção de entidades

*     path: string;
  Caminho absoluto da coleção.
  Pode não estar definido se este hook está sendo usado em um componente e o caminho é
  dinâmico. Se não estiver definido, o diálogo não será aberto.

*     selectedEntityIds?: string[];
  Se você está abrindo o diálogo pela primeira vez, pode selecionar alguns
  ids de entidade para serem exibidos primeiro.

*     onSingleEntitySelected?(entity: Entity | null): void;
  Se `multiselect` estiver definido como `false`, você receberá a entidade selecionada
  neste callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  Se `multiselect` estiver definido como `false`, você receberá as entidades selecionadas
  neste callback.

*     onClose?(): void;
  Se o diálogo estiver atualmente aberto, fechá-lo

*     forceFilter?: FilterValues;
  Permitir a seleção apenas de entidades que passem pelo filtro especificado.

Exemplo:

```tsx
import React from "react";
import { useReferenceDialog, useSnackbarController, Entity } from "@firecms/core";
import { Button } from "@firecms/ui";

type Product = {
    name: string;
    price: number;
};

export function ExampleCMSView() {

    // hook para exibir snackbars personalizados
    const snackbarController = useSnackbarController();

    // hook para abrir um diálogo de referência
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Selecionado " + entity?.values.name
            })
        }
    });

    return <Button
        onClick={referenceDialog.open}
        color="primary">
        Testar diálogo de referência
    </Button>;
}
```
