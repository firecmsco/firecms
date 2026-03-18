---
slug: pt/docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Acesse a fonte de armazenamento do FireCMS para fazer upload de arquivos e obter URLs de download. Funciona com Firebase Storage ou qualquer implementação de armazenamento personalizada.
---

Use este hook para acessar a fonte de armazenamento utilizada na sua aplicação FireCMS.

Cada arquivo enviado no FireCMS é referenciado por uma string na forma
`${path}/${fileName}`, que é então referenciada na fonte de dados como um valor
de string em propriedades que possuem uma configuração de armazenamento.

Você pode usar este controlador para fazer upload de arquivos e obter o caminho de armazenamento onde foi
salvo. Depois, você pode converter esse caminho de armazenamento em uma URL de download.

:::note
Observe que para usar este hook você **deve** estar em
um componente (não é possível usá-lo diretamente em uma função callback).
:::

### Métodos disponíveis

* `uploadFile`: Fazer upload de um arquivo, especificando o arquivo, nome e caminho
* `getDownloadURL`: Converter um caminho de armazenamento em uma URL de download

### Exemplo

```tsx
import React from "react";
import { useStorageSource } from "@firecms/core";
import { Button } from "@firecms/ui";

export function FileUploader() {
    const storageSource = useStorageSource();

    const handleUpload = async (file: File) => {
        const result = await storageSource.uploadFile({
            file,
            fileName: file.name,
            path: "uploads",
        });
        console.log("Arquivo enviado para:", result.path);
    };

    return (
        <input
            type="file"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                    handleUpload(e.target.files[0]);
                }
            }}
        />
    );
}
```
