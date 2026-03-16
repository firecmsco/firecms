---
slug: pt/docs/hooks/use_clipboard
title: useClipboard
sidebar_label: useClipboard
description: Hook para copiar texto para a área de transferência com feedback em FireCMS.
---

Utilize este hook para copiar valores para a área de transferência. Ele retorna uma função que, quando chamada com um valor, o copia para a área de transferência e opcionalmente exibe feedback.

:::note
Note que para utilizar este hook, você **deve** estar em um
componente (não pode utilizá-lo diretamente de uma função callback).
:::

### Utilização

```tsx
import { useClipboard } from "@firecms/core";

export function MyComponent() {
    const { copy } = useClipboard();
    
    return <Button onClick={() => copy("Hello!")}>Copiar</Button>;
}
```

### Opções

| Opção | Tipo | Descrição |
|---|---|---|
| `timeout` | `number` | Tempo em ms antes que o estado copiado seja redefinido. Padrão `2000`. |

### Valores de retorno

| Valor | Tipo | Descrição |
|---|---|---|
| `copy` | `(value: string) => void` | Função para copiar um valor para a área de transferência |
| `copied` | `boolean` | Se um valor foi copiado recentemente |
| `error` | `Error \| null` | Erro se a cópia falhou |
