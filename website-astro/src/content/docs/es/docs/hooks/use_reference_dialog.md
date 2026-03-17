---
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note 
Ten en cuenta que para usar este hook **debes** estar en un
componente (no puedes usarlo directamente desde una función de callback).
:::

## `useReferenceDialog`

Este hook se usa para abrir un diálogo lateral que permite la selección de entidades
bajo una ruta dada. Puedes usarlo en vistas personalizadas para seleccionar entidades.
Necesitas especificar como mínimo la ruta de la colección destino. Si tu colección
no está definida en la configuración de colecciones de nivel superior
(en tu componente `FireCMS`), necesitas especificarla explícitamente. Es el mismo
hook que se usa internamente cuando se define una propiedad de referencia.

Las props proporcionadas por este hook son:

*     multiselect?: boolean;
  Permite la selección múltiple de valores

*     collection?: EntityCollection;
  Configuración de la colección de entidades

*     path: string;
  Ruta absoluta de la colección.
  Puede no estar establecida si este hook se usa en un componente y la ruta es
  dinámica. Si no está establecida, el diálogo no se abrirá.

*     selectedEntityIds?: string[];
  Si estás abriendo el diálogo por primera vez, puedes seleccionar algunos
  IDs de entidades para que se muestren primero.

*     onSingleEntitySelected?(entity: Entity | null): void;
  Si `multiselect` está en `false`, obtendrás la entidad seleccionada
  en este callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  Si `multiselect` está en `false`, obtendrás las entidades seleccionadas
  en este callback.

*     onClose?(): void;
  Si el diálogo está actualmente abierto, lo cierra

*     forceFilter?: FilterValues;
  Permite la selección solo de entidades que pasen el filtro dado.

Ejemplo:

```tsx
import React from "react";
import { useReferenceDialog, useSnackbarController, Entity } from "@firecms/core";
import { Button } from "@firecms/ui";

type Product = {
    name: string;
    price: number;
};

export function ExampleCMSView() {

    // hook para mostrar snackbars personalizados
    const snackbarController = useSnackbarController();

    // hook para abrir un diálogo de referencia
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Seleccionado " + entity?.values.name
            })
        }
    });

    return <Button
        onClick={referenceDialog.open}
        color="primary">
        Probar diálogo de referencia
    </Button>;
}
```

