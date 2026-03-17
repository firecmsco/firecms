---
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook per gestire i pannelli laterali in FireCMS.
---

Hook per recuperare il controller dei pannelli laterali. Questo hook ti permette di aprire e chiudere pannelli laterali in modo programmatico.

Questo è il meccanismo di basso livello usato da FireCMS per aprire:
*   Form entità (Side Entity Controller)
*   Dialog di selezione riferimenti

Puoi usarlo per aprire i tuoi pannelli laterali personalizzati.

:::tip
Se vuoi semplicemente aprire un form entità, usa invece **[`useSideEntityController`](./use_side_entity_controller)**.
:::

### Utilizzo

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
                    <h2 className="text-2xl font-bold mb-4">Pannello personalizzato</h2>
                    <p>Questo è un pannello laterale personalizzato.</p>
                    <Button onClick={() => sideDialogsController.close()}>
                        Chiudi
                    </Button>
                </div>
            )
        });
    };

    return <Button onClick={openPanel}>Apri pannello personalizzato</Button>;
}
```

### Interfaccia

```tsx
export interface SideDialogsController {
    /**
     * Chiudi l'ultimo pannello
     */
    close: () => void;

    /**
     * Lista dei pannelli laterali attualmente aperti
     */
    sidePanels: SideDialogPanelProps[];

    /**
     * Apri uno o più pannelli laterali
     */
    open: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;

    /**
     * Sostituisci l'ultimo pannello aperto con quello specificato
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
