---
slug: pt/docs/hooks/use_reference_dialog
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note 
Note que para utilizar este hook, você **deve** estar em um
componente (não pode utilizá-lo diretamente de uma função callback).
:::

## `useReferenceDialog`

Este hook é usado para abrir um diálogo lateral que permite a seleção de entidades
sob um caminho dado. Você pode usá-lo em vistas personalizadas para selecionar entidades. Você
precisa especificar o caminho da coleção alvo no mínimo. Se sua coleção
não estiver definida na configuração de coleção principal
(no seu componente `FireCMS`), você precisa especificá-la explicitamente. Este é o mesmo
hook usado internamente quando uma propriedade de referência é definida.

As props fornecidas por este hook são:

*     multiselect?: boolean;
  Permitir seleção múltipla de valores

*     collection?: EntityCollection;
  Configuração da coleção de entidades

*     path: string;
  Caminho absoluto da coleção.
  Pode não ser definido se este hook estiver sendo usado em um componente e o caminho for
  dinâmico. Se não definido, o diálogo não abrirá.

*     selectedEntityIds?: string[];
  Se estiver abrindo o diálogo pela primeira vez, pode selecionar alguns
  IDs de entidade para serem exibidos primeiro.

*     onSingleEntitySelected?(entity: Entity | null): void;
  Se `multiselect` estiver definido como `false`, você receberá a entidade selecionada
  neste callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  Se `multiselect` estiver definido como `false`, você receberá as entidades selecionadas
  neste callback.

*     onClose?(): void;
  Se o diálogo estiver atualmente aberto, fechá-lo

*     forceFilter?: FilterValues;
  Permitir seleção apenas de entidades que passem no filtro dado.

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
    const snackbarController = useSnackbarController();

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

