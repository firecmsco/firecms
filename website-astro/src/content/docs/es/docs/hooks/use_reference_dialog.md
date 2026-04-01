---
slug: es/docs/hooks/use_reference_dialog
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note
Tenga en cuenta que para usar este hook **debe** estar en un
componente (no puede usarlos directamente desde una función callback).
:::

## `useReferenceDialog`

Este hook se utiliza para abrir un diálogo lateral que permite la selección de entidades
bajo una ruta dada. Puede usarlo en vistas personalizadas para seleccionar entidades.
Necesita especificar al menos la ruta de la colección de destino. Si su colección
no está definida en la configuración de colecciones principal
(en su componente `FireCMS`), necesita especificarla explícitamente. Este es el mismo
hook utilizado internamente cuando se define una propiedad de referencia.

Las propiedades proporcionadas por este hook son:

*     multiselect?: boolean;
  Permitir selección múltiple de valores

*     collection?: EntityCollection;
  Configuración de la colección de entidades

*     path: string;
  Ruta absoluta de la colección.
  Puede no estar establecida si este hook se usa en un componente y la ruta es
  dinámica. Si no se establece, el diálogo no se abrirá.

*     selectedEntityIds?: string[];
  Si está abriendo el diálogo por primera vez, puede seleccionar algunos
  ids de entidad para que se muestren primero.

*     onSingleEntitySelected?(entity: Entity | null): void;
  Si `multiselect` está establecido en `false`, obtendrá la entidad seleccionada
  en este callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  Si `multiselect` está establecido en `false`, obtendrá las entidades seleccionadas
  en este callback.

*     onClose?(): void;
  Si el diálogo está actualmente abierto, cerrarlo

*     forceFilter?: FilterValues;
  Permitir la selección solo de entidades que pasen el filtro dado.

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
