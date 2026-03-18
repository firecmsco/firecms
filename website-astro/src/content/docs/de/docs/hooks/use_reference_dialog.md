---
slug: de/docs/hooks/use_reference_dialog
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note
Bitte beachten Sie, dass Sie diesen Hook **nur** innerhalb einer
Komponente verwenden können (Sie können ihn nicht direkt in einer Callback-Funktion verwenden).
:::

## `useReferenceDialog`

Dieser Hook wird verwendet, um einen Seitendialog zu öffnen, der die Auswahl von Entitäten
unter einem bestimmten Pfad ermöglicht. Sie können ihn in benutzerdefinierten Ansichten zur Auswahl von Entitäten verwenden.
Sie müssen mindestens den Pfad der Zielsammlung angeben. Wenn Ihre Sammlung
nicht in der Hauptnavigationskonfiguration definiert ist
(in Ihrer `FireCMS`-Komponente), müssen Sie sie explizit angeben. Dies ist derselbe
Hook, der intern verwendet wird, wenn eine Referenz-Eigenschaft definiert ist.

Die von diesem Hook bereitgestellten Eigenschaften sind:

*     multiselect?: boolean;
  Mehrfachauswahl von Werten erlauben

*     collection?: EntityCollection;
  Konfiguration der Entitätssammlung

*     path: string;
  Absoluter Pfad der Sammlung.
  Kann nicht gesetzt sein, wenn dieser Hook in einer Komponente verwendet wird und der Pfad
  dynamisch ist. Wenn nicht gesetzt, wird der Dialog nicht geöffnet.

*     selectedEntityIds?: string[];
  Wenn Sie den Dialog zum ersten Mal öffnen, können Sie einige
  Entitäts-IDs auswählen, die zuerst angezeigt werden.

*     onSingleEntitySelected?(entity: Entity | null): void;
  Wenn `multiselect` auf `false` gesetzt ist, erhalten Sie die ausgewählte Entität
  in diesem Callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  Wenn `multiselect` auf `false` gesetzt ist, erhalten Sie die ausgewählten Entitäten
  in diesem Callback.

*     onClose?(): void;
  Wenn der Dialog gerade geöffnet ist, schließen

*     forceFilter?: FilterValues;
  Nur die Auswahl von Entitäten erlauben, die den angegebenen Filter bestehen.

Beispiel:

```tsx
import React from "react";
import { useReferenceDialog, useSnackbarController, Entity } from "@firecms/core";
import { Button } from "@firecms/ui";

type Product = {
    name: string;
    price: number;
};

export function ExampleCMSView() {

    // Hook zum Anzeigen benutzerdefinierter Snackbars
    const snackbarController = useSnackbarController();

    // Hook zum Öffnen eines Referenzdialogs
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Ausgewählt: " + entity?.values.name
            })
        }
    });

    return <Button
        onClick={referenceDialog.open}
        color="primary">
        Referenzdialog testen
    </Button>;
}
```
