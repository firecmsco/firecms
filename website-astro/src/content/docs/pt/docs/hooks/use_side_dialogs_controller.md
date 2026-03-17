---
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook para gerenciar diálogos/painéis laterais no FireCMS.
---

Hook para recuperar o controlador dos diálogos laterais. Este hook permite abrir e fechar painéis laterais programaticamente.

Este é o mecanismo de baixo nível usado pelo FireCMS para abrir:
*   Formulários de entidades (Side Entity Controller)
*   Diálogos de seleção de referências

Você pode utilizá-lo para abrir seus próprios painéis laterais personalizados.

:::tip
Se deseja simplesmente abrir um formulário de entidade, use **[`useSideEntityController`](./use_side_entity_controller)** em vez disso.
:::

### Utilização

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
                    <h2 className="text-2xl font-bold mb-4">Painel personalizado</h2>
                    <p>Este é um painel lateral personalizado.</p>
                    <Button onClick={() => sideDialogsController.close()}>
                        Fechar
                    </Button>
                </div>
            )
        });
    };

    return <Button onClick={openPanel}>Abrir painel personalizado</Button>;
}
```

### Interface

```tsx
export interface SideDialogsController {
    close: () => void;
    sidePanels: SideDialogPanelProps[];
    open: (panelProps: SideDialogPanelProps | SideDialogPanelProps[]) => void;
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
