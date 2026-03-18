---
slug: pt/docs/hooks/use_clipboard
title: useClipboard
sidebar_label: useClipboard
description: Hook utilitário para copiar texto para a área de transferência.
---

Um hook utilitário para copiar texto para a área de transferência do sistema. Ele gerencia a API `navigator.clipboard` e mecanismos de fallback.

### Uso

```tsx
import React from "react";
import { useClipboard } from "@firecms/core";
import { Button } from "@firecms/ui";

export function CopyButton({ text }: { text: string }) {
    const { copy, isCoppied } = useClipboard({
        copiedDuration: 2000 // Redefinir estado após 2 segundos
    });

    return (
        <Button onClick={() => copy(text)}>
            {isCoppied ? "Copiado!" : "Copiar para a área de transferência"}
        </Button>
    );
}
```

### Opções

```tsx
export interface UseClipboardProps {
    /**
     * Função callback chamada após a execução do comando `copy`.
     */
    onSuccess?: (text: string) => void;

    /**
     * Acionado quando o hook encontra um erro.
     */
    onError?: (error: string) => void;

    /**
     * Desabilita a nova API da área de transferência `navigator.clipboard` mesmo que seja suportada.
     */
    disableClipboardAPI?: boolean;

    /**
     * Duração em ms para manter o flag `isCoppied` como true.
     */
    copiedDuration?: number;
}
```

### Valores de retorno

```tsx
export interface useClipboardReturnType {
    /**
     * Ref para obter o conteúdo de texto.
     */
    ref: MutableRefObject<any>;

    /**
     * Realizar a operação de cópia
     */
    copy: (text?: string) => void;

    /**
     * Realizar a operação de recortar
     */
    cut: () => void;

    /**
     * Indica se o conteúdo foi copiado com sucesso.
     * Nota: Erro de digitação herdado da biblioteca de origem.
     */
    isCoppied: boolean;

    /**
     * Conteúdo atual da área de transferência selecionado.
     */
    clipboard: string;

    /**
     * Limpa a área de transferência do usuário.
     */
    clearClipboard: () => void;

    /**
     * Verifica se o navegador suporta a API `navigator.clipboard`.
     */
    isSupported: () => boolean;
}
```
