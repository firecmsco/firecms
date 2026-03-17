---
title: useClipboard
sidebar_label: useClipboard
description: Utility-Hook zum Kopieren von Text in die Zwischenablage.
---

Ein Utility-Hook zum Kopieren von Text in die Systemzwischenablage.

### Verwendung

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Zustand nach 2 Sekunden zurücksetzen
    });

    return (
        <Button onClick={() => copy(text)}>
            {isCoppied ? "Kopiert!" : "Kopieren"}
        </Button>
    );
}
```
