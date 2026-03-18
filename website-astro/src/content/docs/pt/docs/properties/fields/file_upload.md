---
title: Upload de arquivos
slug: pt/docs/properties/fields/file_upload
---

Use os campos de upload de arquivos para permitir que os utilizadores enviem imagens, documentos ou qualquer
arquivo para sua solução de armazenamento (Firebase Storage por padrão). Este campo é
responsável por enviar o arquivo e salvar o caminho de armazenamento como o valor
da sua propriedade.

:::note
Pode salvar a URL do arquivo enviado, em vez do caminho do Storage,
definindo `storeUrl`.
:::

Pode também permitir o upload apenas de alguns tipos de arquivo baseado no
[tipo MIME](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types),
ou restringir o tamanho do arquivo.

Se o arquivo enviado for uma imagem, pode também escolher redimensioná-la antes
de ser enviada para o backend de armazenamento, com a prop `imageCompression`.

A lista completa de parâmetros que pode usar ao enviar arquivos:

* `mediaType` Tipo de mídia desta referência, usado para exibir a pré-visualização.
* `storagePath` Caminho absoluto no seu bucket.
* `acceptedFiles` [Tipo MIME](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) de arquivo que pode ser enviado.
* `metadata` Metadados específicos definidos no arquivo enviado.
* `fileName` Callback para personalizar o nome do arquivo.
* `storeUrl` Quando `true`, a URL de download será salva no Firestore em vez do caminho do Cloud Storage.
* `imageCompression` Compressão e redimensionamento de imagem do lado do cliente.

:::note
Pode usar alguns espaços reservados no `storagePath` e `fileName` para personalizar o caminho e nome do arquivo. Os espaços reservados disponíveis são:

- \{file\} - Nome completo do arquivo
- \{file.name\} - Nome do arquivo sem extensão
- \{file.ext\} - Extensão do arquivo
- \{rand\} - Valor aleatório para evitar colisões de nomes
- \{entityId\} - ID da entidade
- \{propertyKey\} - ID desta propriedade
- \{path\} - Caminho desta entidade
:::

### Upload de arquivo único

![Field](/img/fields/File_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Image",
    storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"],
        maxSize: 1024 * 1024,
        metadata: {
            cacheControl: "max-age=1000000"
        },
        fileName: (context) => {
            return context.file.name;
        }
    }
});
```

O tipo de dado é [`string`](../config/string).

Internamente o componente usado
é [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Upload de múltiplos arquivos

![Field](/img/fields/Multi_file_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Images",
    of: {
        dataType: "string",
        storage: {
            storagePath: "images",
            acceptedFiles: ["image/*"],
            metadata: {
                cacheControl: "max-age=1000000"
            }
        }
    },
    description: "Este campo permite o upload de múltiplas imagens de uma vez"
});
```

O tipo de dado é [`array`](../config/array).

Internamente o componente usado
é [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Suporte personalizado para imagens, vídeos e áudio

Você é livre para usar a propriedade `storage` para enviar qualquer tipo de arquivo, mas
o FireCMS também fornece suporte personalizado para imagens, vídeos e áudio.

Não precisa fazer nenhuma alteração específica e este comportamento está habilitado por
padrão. O FireCMS detectará automaticamente se o arquivo é uma imagem, vídeo ou
áudio e exibirá a pré-visualização correspondente.

Os tipos MIME suportados para pré-visualizações personalizadas são:

- `image/*`
- `video/*`
- `audio/*`

(isto inclui todos os formatos de arquivo relacionados a estas categorias)
