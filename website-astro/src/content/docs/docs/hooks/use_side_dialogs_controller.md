---
slug: docs/hooks/use_side_dialogs_controller
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook to manage side dialogs/panels in FireCMS.
---

Hook to retrieve the side dialogs' controller. This hook allows you to open and close side panels programmatically. 

This is the low-level mechanism used by FireCMS to open:
*   Entity forms (Side Entity Controller)
*   Reference selection dialogs

You can use it to open your own custom side panels.

:::tip
If you just want to open an entity form form, use **[`useSideEntityController`](./use_side_entity_controller)** instead.
:::

### Usage

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
                    <h2 className="text-2xl font-bold mb-4">Custom Panel</h2>
                    <p>This is a custom side panel.</p>
                    <Button onClick={() => sideDialogsController.close()}>
                        Close
                    </Button>
                </div>
            )
        });
    };

    return <Button onClick={openPanel}>Open Custom Panel</Button>;
}
```

### Interface

```tsx
export interface SideDialogsController {
    /**
     * Close the last panel
     */
    close: () => void;

    /**
     * List of side panels currently open
     */
    sidePanels: SideDialogPanelProps[];

    /**
     * Open one or multiple side panels
     */
    open: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;

    /**
     * Replace the last open panel with the given one
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
