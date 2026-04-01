---
slug: de/docs/hooks/use_side_entity_controller
title: useSideEntityController
sidebar_label: useSideEntityController
---

:::note
Bitte beachten Sie, dass Sie diese Hooks **nur** innerhalb
einer Komponente verwenden können (Sie können sie nicht direkt in einer Callback-Funktion verwenden).
Callbacks enthalten in der Regel jedoch einen `FireCMSContext`, der alle
Controller enthält.
:::

Sie können diesen Controller verwenden, um die seitliche Entitätsansicht zum Bearbeiten von Entitäten zu öffnen.
Dies ist derselbe Controller, den das CMS verwendet, wenn Sie auf eine Entität in einer
Sammlungsansicht klicken.

Mit diesem Controller können Sie ein Formular in einem Seitendialog öffnen, auch wenn der Pfad und
das Entitätsschema nicht in der Hauptnavigation in `FireCMS` definiert sind.

Die von diesem Hook bereitgestellten Eigenschaften sind:

* `close()` Das letzte Panel schließen
* `sidePanels` Liste der derzeit geöffneten seitlichen Entitätspanels
* `open (props: SideEntityPanelProps)`
  Einen neuen seitlichen Entitätsdialog öffnen. Standardmäßig werden das Schema und die Konfiguration der
  Ansicht aus den Sammlungen abgerufen, die Sie in der Navigation angegeben haben. Sie
  müssen mindestens den Pfad der Entität angeben, die Sie
  bearbeiten möchten. Sie können eine entityId festlegen, wenn Sie eine bestehende bearbeiten möchten
  (oder eine neue mit dieser Id erstellen).

Beispiel:

```tsx
import React from "react";
import { useSideEntityController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const sideEntityController = useSideEntityController();

    // Sie müssen kein Schema angeben, wenn der Sammlungspfad in der
    // Hauptnavigation zugeordnet ist
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
                collection: customProductCollection // optional
            })}
            color="primary">
            Entität mit benutzerdefiniertem Schema öffnen
        </Button>
    );
}
```
