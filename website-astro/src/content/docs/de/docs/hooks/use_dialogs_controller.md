---
title: useDialogsController
sidebar_label: useDialogsController
description: Hook zum imperativ Öffnen von Dialogen in FireCMS.
---

Verwenden Sie diesen Hook, um Dialoge imperativ zu öffnen. Dies ist nützlich, wenn Sie einen Bestätigungsdialog oder ein benutzerdefiniertes Modal aus einem Callback oder einem Event-Handler anzeigen müssen.

:::note
Sie müssen ein Kind der `FireCMS`-Komponente sein, um diesen Hook zu verwenden.
:::

### Verwendung

```tsx
import React from "react";
import { useDialogsController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ConfirmButton() {
    const dialogsController = useDialogsController();

    const handleClick = async () => {
        const confirmed = await dialogsController.confirm({
            title: "Aktion bestätigen",
            body: "Sind Sie sicher, dass Sie diese Aktion durchführen möchten?",
            acceptLabel: "Ja",
            cancelLabel: "Abbrechen"
        });

        if (confirmed) {
            console.log("Bestätigt!");
        }
    };

    return <Button onClick={handleClick}>Aktion durchführen</Button>;
}
```
