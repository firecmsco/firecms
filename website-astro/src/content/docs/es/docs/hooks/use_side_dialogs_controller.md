---
slug: es/docs/hooks/use_side_dialogs_controller
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook para gestionar diálogos/paneles laterales en FireCMS.
---

Hook para obtener el controlador de diálogos laterales. Este hook le permite abrir y cerrar paneles laterales de forma programática.

Este es el mecanismo de bajo nivel utilizado por FireCMS para abrir:
*   Formularios de entidad (Side Entity Controller)
*   Diálogos de selección de referencia

Puede usarlo para abrir sus propios paneles laterales personalizados.

:::tip
Si solo desea abrir un formulario de entidad, use **[`useSideEntityController`](./use_side_entity_controller)** en su lugar.
:::

### Uso

```tsx
import React from "react";
import { useSideDialogsController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CustomSidePanelExample() {
    const sideDialogsController = useSideDialogsController();

    const openPanel = () => {
        sideDialogsController.open({
            key: "custom_panel",
            width: "500px",
            component: (
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-4">Panel personalizado</h2>
                    <p>Este es un panel lateral personalizado.</p>
                    <Button onClick={() => sideDialogsController.close()}>
                        Cerrar
                    </Button>
                </div>
            )
        });
    };

    return <Button onClick={openPanel}>Abrir panel personalizado</Button>;
}
```

### Interfaz

```tsx
export interface SideDialogsController {
    /**
     * Cerrar el último panel
     */
    close: () => void;

    /**
     * Lista de paneles laterales actualmente abiertos
     */
    sidePanels: SideDialogPanelProps[];

    /**
     * Abrir uno o múltiples paneles laterales
     */
    open: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;

    /**
     * Reemplazar el último panel abierto con el dado
     */
    replace: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;
}
```

### SideDialogPanelProps

```tsx
export interface SideDialogPanelProps {
    key: string;
    component: React.ReactNode;
    width?: string;
    urlPath?: string;
    parentUrlPath?: string;
    onClose?: () => void;
    additional?: any;
}
```
