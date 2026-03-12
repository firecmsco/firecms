---
slug: it/docs/hooks/use_clipboard
title: useClipboard
sidebar_label: useClipboard
description: Hook di utilità per copiare testo negli appunti.
---

Un hook di utilità per copiare testo negli appunti di sistema. Gestisce l'API `navigator.clipboard` e i meccanismi di fallback.

### Utilizzo

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Reimposta lo stato dopo 2 secondi
    });

    return (
        <Button onClick={() => copy(text)}>
            {isCoppied ? "Copiato!" : "Copia negli appunti"}
        </Button>
    );
}
```

### Opzioni

```tsx
export interface UseClipboardProps {
    /**
     * Funzione di callback chiamata dopo l'esecuzione del comando `copy`.
     */
    onSuccess?: (text: string) => void;

    /**
     * Viene attivata quando l'hook incontra un errore.
     */
    onError?: (error: string) => void;

    /**
     * Disabilita la nuova API clipboard `navigator.clipboard` anche se è supportata.
     */
    disableClipboardAPI?: boolean;

    /**
     * Durata in ms per mantenere il flag `isCoppied` su true.
     */
    copiedDuration?: number;
}
```

### Valori restituiti

```tsx
export interface useClipboardReturnType {
    /**
     * Usa ref per estrarre il contenuto testuale.
     */
    ref: MutableRefObject<any>;

    /**
     * Esegui l'operazione di copia
     */
    copy: (text?: string) => void;

    /**
     * Esegui l'operazione di taglio
     */
    cut: () => void;

    /**
     * Indica se il contenuto è stato copiato con successo.
     * Nota: Typo ereditato dalla libreria sorgente.
     */
    isCoppied: boolean;

    /**
     * Contenuto degli appunti attualmente selezionato.
     */
    clipboard: string;

    /**
     * Cancella gli appunti dell'utente.
     */
    clearClipboard: () => void;

    /**
     * Controlla se il browser supporta l'API `navigator.clipboard`.
     */
    isSupported: () => boolean;
}
```
