---
slug: de/docs/hooks/use_side_dialogs_controller
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook zur Verwaltung von Seitendialogen/-panels in FireCMS.
---

Hook zum Abrufen des Seitendialog-Controllers. Dieser Hook ermöglicht es Ihnen, Seitenpanels programmatisch zu öffnen und zu schließen.

Dies ist der grundlegende Mechanismus, den FireCMS verwendet, um folgendes zu öffnen:
*   Entitätsformulare (Side Entity Controller)
*   Referenzauswahl-Dialoge

Sie können ihn verwenden, um Ihre eigenen benutzerdefinierten Seitenpanels zu öffnen.

:::tip
Wenn Sie nur ein Entitätsformular öffnen möchten, verwenden Sie stattdessen **[`useSideEntityController`](./use_side_entity_controller)**.
:::

### Verwendung

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
                    <h2 className="text-2xl font-bold mb-4">Benutzerdefiniertes Panel</h2>
                    <p>Dies ist ein benutzerdefiniertes Seitenpanel.</p>
                    <Button onClick={() => sideDialogsController.close()}>
                        Schließen
                    </Button>
                </div>
            )
        });
    };

    return <Button onClick={openPanel}>Benutzerdefiniertes Panel öffnen</Button>;
}
```

### Schnittstelle

```tsx
export interface SideDialogsController {
    /**
     * Das letzte Panel schließen
     */
    close: () => void;

    /**
     * Liste der derzeit geöffneten Seitenpanels
     */
    sidePanels: SideDialogPanelProps[];

    /**
     * Ein oder mehrere Seitenpanels öffnen
     */
    open: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;

    /**
     * Das zuletzt geöffnete Panel durch das angegebene ersetzen
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
