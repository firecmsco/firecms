---
slug: it/docs/hooks/use_clipboard
title: useClipboard
sidebar_label: useClipboard
description: Hook utilitario per copiare testo negli appunti.
---

Un hook utilitario per copiare testo negli appunti di sistema. Gestisce l'API `navigator.clipboard` e i meccanismi di fallback.

### Utilizzo

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Resetta lo stato dopo 2 secondi
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
     * Funzione callback chiamata dopo l'esecuzione del comando `copy`.
     */
    onSuccess?: (text: string) => void;

    /**
     * Si attiva quando l'hook incontra un errore.
     */
    onError?: (error: string) => void;

    /**
     * Disabilita la nuova API degli appunti `navigator.clipboard` anche se è supportata.
     */
    disableClipboardAPI?: boolean;

    /**
     * Durata in ms per mantenere il flag `isCoppied` su true.
     */
    copiedDuration?: number;
}
```

### Valori di ritorno

```tsx
export interface useClipboardReturnType {
    /**
     * Ref per ottenere il contenuto testuale.
     */
    ref: MutableRefObject<any>;

    /**
     * Eseguire l'operazione di copia
     */
    copy: (text?: string) => void;

    /**
     * Eseguire l'operazione di taglio
     */
    cut: () => void;

    /**
     * Indica se il contenuto è stato copiato con successo.
     * Nota: Errore di battitura ereditato dalla libreria sorgente.
     */
    isCoppied: boolean;

    /**
     * Contenuto attuale degli appunti selezionato.
     */
    clipboard: string;

    /**
     * Pulisce gli appunti dell'utente.
     */
    clearClipboard: () => void;

    /**
     * Verifica se il browser supporta l'API `navigator.clipboard`.
     */
    isSupported: () => boolean;
}
```
