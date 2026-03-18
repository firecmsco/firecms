---
slug: pt/docs/hooks/use_side_entity_controller
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Observe que para usar esses hooks você **deve** estar dentro
de um componente (não é possível usá-los diretamente em uma função callback).
No entanto, os callbacks geralmente incluem um `FireCMSContext`, que contém todos
os controladores.
:::

Você pode usar este controlador para abrir a visualização lateral de entidade usada para editar entidades.
Este é o mesmo controlador que o CMS usa quando você clica em uma entidade em uma vista de
coleção.

Usando este controlador você pode abrir um formulário em um diálogo lateral, mesmo que o caminho e
o esquema da entidade não estejam incluídos na navegação principal definida em `FireCMS`.

As propriedades fornecidas por este hook são:

* `close()` Fechar o último painel
* `sidePanels` Lista de painéis laterais de entidade atualmente abertos
* `open (props: SideEntityPanelProps)`
  Abrir um novo diálogo lateral de entidade. Por padrão, o esquema e a configuração da
  visualização são obtidos a partir das coleções que você especificou na navegação. No
  mínimo, você precisa passar o caminho da entidade que deseja
  editar. Você pode definir um entityId se deseja editar uma existente
  (ou criar uma nova com esse id).

Exemplo:

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // Você não precisa fornecer um esquema se o caminho da coleção está mapeado na
    // navegação principal
    const customProductCollection = buildCollection({
        name: "Product",
        properties: {
            name: {
                name: "Name",
                validation: { required: true },
                dataType: "string"
            },
        }
    });

    return (
        <Button
            onClick={() => sideEntityController.open({
                entityId: "B003WT1622",
                path: "/products",
                collection: customProductCollection // opcional
            })}
            color="primary">
            Abrir entidade com esquema personalizado
        </Button>
    );
}
```
