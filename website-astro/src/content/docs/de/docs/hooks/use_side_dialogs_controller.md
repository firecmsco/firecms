---
slug: de/docs/hooks/use_side_dialogs_controller
title: useSideDialogsController
sidebar_label: useSideDialogsController
description: Hook zur Verwaltung von Seitendialogen/-panels in FireCMS.
---

Hook zum Abrufen des Seitendialogs-Controllers. Dieser Hook ermöglicht es Ihnen, Seitenpanels programmgesteuert zu öffnen und zu schließen.

Dies ist der Low-Level-Mechanismus, der von FireCMS zum Öffnen verwendet wird:
*   Entity-Formulare (Side Entity Controller)
*   Referenzauswahl-Dialoge

Sie können diesen Hook verwenden, um Ihre eigenen benutzerdefinierten Seitenpanels zu öffnen.

:::tip
Wenn Sie lediglich ein Entity-Formular öffnen möchten, verwenden Sie stattdessen **[`useSideEntityController`](./use_side_entity_controller)**.
:::

### Verwendung

```tsx
import { useSideDialogsController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CustomPanelOpener() {
    const sideDialogsController = useSideDialogsController();
    
    return (
        <Button
            onClick={() => sideDialogsController.open({
                key: "custom-panel",
                Component: <div>Mein benutzerdefiniertes Panel</div>
            })}>
            Panel öffnen
        </Button>
    );
}
```
