---
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Bitte beachten Sie, dass Sie zur Verwendung dieser Hooks **in einer Komponente** sein müssen.
Callbacks beinhalten normalerweise einen `FireCMSContext`, der alle Controller enthält.
:::

Sie können diesen Controller verwenden, um die seitliche Entity-Ansicht zur Bearbeitung von Entities zu öffnen.
Dies ist derselbe Controller, den das CMS verwendet, wenn Sie auf eine Entity in einer Kollektionsansicht klicken.

Die von diesem Hook bereitgestellten Props sind:

* `close()` Das letzte Panel schließen
* `sidePanels` Liste der derzeit geöffneten seitlichen Entity-Panels
* `open (props: SideEntityPanelProps)` Ein neues Entity-SideDialog öffnen.

Beispiel:

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

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
                collection: customProductCollection
            })}
            color="primary">
            Entity mit benutzerdefiniertem Schema öffnen
        </Button>
    );
}
```
