---
slug: de/docs/hooks/use_clipboard
title: useClipboard
sidebar_label: useClipboard
description: Utility-Hook zum Kopieren von Text in die Zwischenablage.
---

Ein Utility-Hook zum Kopieren von Text in die Systemzwischenablage. Er verwaltet die `navigator.clipboard`-API und Fallback-Mechanismen.

### Verwendung

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Status nach 2 Sekunden zurücksetzen
    });

    return (
        <Button onClick={() => copy(text)}>
            {isCoppied ? "Kopiert!" : "In die Zwischenablage kopieren"}
        </Button>
    );
}
```

### Optionen

```tsx
export interface UseClipboardProps {
    /**
     * Callback-Funktion, die nach der Ausführung des `copy`-Befehls aufgerufen wird.
     */
    onSuccess?: (text: string) => void;

    /**
     * Wird ausgelöst, wenn der Hook auf einen Fehler stößt.
     */
    onError?: (error: string) => void;

    /**
     * Deaktiviert die neue Zwischenablage-API `navigator.clipboard`, auch wenn sie unterstützt wird.
     */
    disableClipboardAPI?: boolean;

    /**
     * Dauer in ms, für die das `isCoppied`-Flag auf true bleibt.
     */
    copiedDuration?: number;
}
```

### Rückgabewerte

```tsx
export interface useClipboardReturnType {
    /**
     * Ref zum Abrufen des Textinhalts.
     */
    ref: MutableRefObject<any>;

    /**
     * Kopiervorgang ausführen
     */
    copy: (text?: string) => void;

    /**
     * Ausschneiden-Vorgang ausführen
     */
    cut: () => void;

    /**
     * Gibt an, ob der Inhalt erfolgreich kopiert wurde.
     * Hinweis: Tippfehler von der Quellbibliothek übernommen.
     */
    isCoppied: boolean;

    /**
     * Aktuell ausgewählter Zwischenablageinhalt.
     */
    clipboard: string;

    /**
     * Leert die Zwischenablage des Benutzers.
     */
    clearClipboard: () => void;

    /**
     * Prüft, ob der Browser die `navigator.clipboard`-API unterstützt.
     */
    isSupported: () => boolean;
}
```
