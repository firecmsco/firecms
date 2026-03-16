---
slug: pt/docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Acesse a fonte de armazenamento do FireCMS para fazer upload de arquivos e recuperar URLs de download.
---

Utilize este hook para acessar a fonte de armazenamento sendo usada na sua aplicação FireCMS.

Cada arquivo enviado no FireCMS é referenciado por uma string na forma
`${path}/${fileName}`, que é então referenciada na fonte de dados como um valor
string em propriedades que têm uma configuração de armazenamento.

Você pode usar este controlador para enviar arquivos e obter o caminho de armazenamento onde foi
armazenado. Depois pode converter esse storagePath em uma URL de download.

:::note
Note que para utilizar este hook, você **deve** estar em um
componente (não pode utilizá-lo diretamente de uma função callback).
:::

### Métodos disponíveis

* `uploadFile`: Enviar um arquivo, especificando o arquivo, nome e caminho
* `getDownloadURL`: Converter um caminho de armazenamento em uma URL de download

### Exemplo

```tsx
import React from "react";
import { useStorageSource } from "@firecms/core";

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
