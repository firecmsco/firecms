---
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note 
Bitte beachten Sie, dass Sie zur Verwendung dieses Hooks **in einer Komponente** sein müssen.
:::

## `useReferenceDialog`

Dieser Hook wird verwendet, um einen Seitendialog zu öffnen, der die Auswahl von Entities unter einem bestimmten Pfad ermöglicht.

```tsx
import { useReferenceDialog } from "@firecms/core";

export function ProductSelector() {
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected: (entity) => {
            console.log("Ausgewählte Entity:", entity);
        }
    });
    
    return (
        <button onClick={referenceDialog.open}>
            Produkt auswählen
        </button>
    );
}
```
