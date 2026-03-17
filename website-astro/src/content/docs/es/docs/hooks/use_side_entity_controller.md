---
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Ten en cuenta que para usar estos hooks **debes** estar en
un componente (no puedes usarlos directamente desde una función de callback).
De todos modos, los callbacks normalmente incluyen un `FireCMSContext`, que contiene todos
los controladores.
:::

Puedes usar este controlador para abrir la vista de entidad lateral utilizada para editar entidades.
Es el mismo controlador que usa el CMS cuando haces clic en una entidad en una vista de colección.

Usando este controlador puedes abrir un formulario en un diálogo lateral, incluso si la ruta y
el esquema de entidad no están incluidos en la navegación principal definida en `FireCMS`.

Las props proporcionadas por este hook son:

* `close()` Cierra el último panel
* `sidePanels` Lista de paneles de entidades laterales actualmente abiertos
* `open (props: SideEntityPanelProps)`
  Abre un nuevo diálogo lateral de entidad. Por defecto, el esquema y la configuración de la
  vista se obtienen de las colecciones que has especificado en la navegación. Como mínimo
  necesitas pasar la ruta de la entidad que deseas editar. Puedes establecer un `entityId`
  si deseas editar una existente (o una nueva con ese id).

Ejemplo:

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // No necesitas proporcionar un esquema si la ruta de la colección está mapeada
    // en la navegación principal
    const customProductCollection = buildCollection({
        name: "Producto",
        properties: {
            name: {
                name: "Nombre",
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
            Abrir entidad con esquema personalizado
        </Button>
    );
}
```

