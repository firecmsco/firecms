---
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook pour gérer les dialogues/panneaux latéraux dans FireCMS.
---

Hook pour récupérer le contrôleur des dialogues latéraux. Ce hook vous permet d'ouvrir et de fermer des panneaux latéraux de manière programmatique.

C'est le mécanisme de bas niveau utilisé par FireCMS pour ouvrir :
*   Les formulaires d'entités (Side Entity Controller)
*   Les dialogues de sélection de références

Vous pouvez l'utiliser pour ouvrir vos propres panneaux latéraux personnalisés.

:::tip
Si vous souhaitez simplement ouvrir un formulaire d'entité, utilisez **[`useSideEntityController`](./use_side_entity_controller)** à la place.
:::

### Utilisation

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
                    <h2 className="text-2xl font-bold mb-4">Panneau personnalisé</h2>
                    <p>Ceci est un panneau latéral personnalisé.</p>
                    <Button onClick={() => sideDialogsController.close()}>
                        Fermer
                    </Button>
                </div>
            )
        });
    };

    return <Button onClick={openPanel}>Ouvrir le panneau personnalisé</Button>;
}
```

### Interface

```tsx
export interface SideDialogsController {
    /**
     * Fermer le dernier panneau
     */
    close: () => void;

    /**
     * Liste des panneaux latéraux actuellement ouverts
     */
    sidePanels: SideDialogPanelProps[];

    /**
     * Ouvrir un ou plusieurs panneaux latéraux
     */
    open: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;

    /**
     * Remplacer le dernier panneau ouvert par celui donné
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
