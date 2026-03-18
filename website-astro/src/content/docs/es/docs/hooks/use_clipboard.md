---
slug: es/docs/hooks/use_clipboard
title: useClipboard
sidebar_label: useClipboard
description: Hook utilitario para copiar texto al portapapeles.
---

Un hook utilitario para copiar texto al portapapeles del sistema. Gestiona la API `navigator.clipboard` y mecanismos de respaldo.

### Uso

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Restablecer estado después de 2 segundos
    });

    return (
        <Button onClick={() => copy(text)}>
            {isCoppied ? "¡Copiado!" : "Copiar al portapapeles"}
        </Button>
    );
}
```

### Opciones

```tsx
export interface UseClipboardProps {
    /**
     * Función callback llamada después de ejecutar el comando `copy`.
     */
    onSuccess?: (text: string) => void;

    /**
     * Se activa cuando el hook encuentra un error.
     */
    onError?: (error: string) => void;

    /**
     * Desactiva la nueva API del portapapeles `navigator.clipboard` incluso si está soportada.
     */
    disableClipboardAPI?: boolean;

    /**
     * Duración en ms para mantener el flag `isCoppied` en true.
     */
    copiedDuration?: number;
}
```

### Valores de retorno

```tsx
export interface useClipboardReturnType {
    /**
     * Ref para obtener el contenido de texto.
     */
    ref: MutableRefObject<any>;

    /**
     * Realizar la operación de copia
     */
    copy: (text?: string) => void;

    /**
     * Realizar la operación de cortar
     */
    cut: () => void;

    /**
     * Indica si el contenido fue copiado exitosamente.
     * Nota: Error tipográfico heredado de la librería fuente.
     */
    isCoppied: boolean;

    /**
     * Contenido actual del portapapeles seleccionado.
     */
    clipboard: string;

    /**
     * Limpia el portapapeles del usuario.
     */
    clearClipboard: () => void;

    /**
     * Verifica si el navegador soporta la API `navigator.clipboard`.
     */
    isSupported: () => boolean;
}
```
