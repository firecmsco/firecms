---
slug: es/docs/hooks/use_side_entity_controller
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Tenga en cuenta que para usar estos hooks **debe** estar en
un componente (no puede usarlos directamente desde una función callback).
De todas formas, los callbacks generalmente incluyen un `FireCMSContext`, que contiene todos
los controladores.
:::

Puede usar este controlador para abrir la vista lateral de entidad utilizada para editar entidades.
Este es el mismo controlador que usa el CMS cuando hace clic en una entidad en una vista de
colección.

Usando este controlador puede abrir un formulario en un diálogo lateral, incluso si la ruta y
el esquema de la entidad no están incluidos en la navegación principal definida en `FireCMS`.

Las propiedades proporcionadas por este hook son:

* `close()` Cerrar el último panel
* `sidePanels` Lista de paneles laterales de entidad actualmente abiertos
* `open (props: SideEntityPanelProps)`
  Abrir un nuevo diálogo lateral de entidad. Por defecto, el esquema y la configuración de la
  vista se obtienen de las colecciones que ha especificado en la navegación. Como
  mínimo necesita pasar la ruta de la entidad que desea
  editar. Puede establecer un entityId si desea editar una existente
  (o una nueva con ese id).

Ejemplo:

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // No necesita proporcionar un esquema si la ruta de la colección está mapeada en
    // la navegación principal
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
            Abrir entidad con esquema personalizado
        </Button>
    );
}
```
