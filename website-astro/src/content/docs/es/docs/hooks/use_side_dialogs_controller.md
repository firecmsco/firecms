---
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook para gestionar diálogos/paneles laterales en FireCMS.
---

Hook para obtener el controlador de diálogos laterales. Este hook te permite abrir y cerrar paneles laterales de forma programática.

Este es el mecanismo de bajo nivel que FireCMS usa para abrir:
*   Formularios de entidades (Controlador de Entidades Lateral)
*   Diálogos de selección de referencias

Puedes usarlo para abrir tus propios paneles laterales personalizados.

:::tip
Si solo deseas abrir un formulario de entidad, usa **[`useSideEntityController`](./use_side_entity_controller)** en su lugar.
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
                    <h2 className="text-2xl font-bold mb-4">Panel Personalizado</h2>
                    <p>Este es un panel lateral personalizado.</p>
                    <Button onClick={() => sideDialogsController.close()}>
                        Cerrar
                    </Button>
                </div>
            )
        });
    };

    return <Button onClick={openPanel}>Abrir Panel Personalizado</Button>;
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
     * Abrir uno o más paneles laterales
     */
    open: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;

    /**
     * Reemplazar el último panel abierto por el indicado
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
