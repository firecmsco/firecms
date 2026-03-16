---
slug: pt/docs/properties/config/string
title: String
sidebar_label: String
description: Configuração de propriedades string no FireCMS, incluindo armazenamento, markdown, enums e opções de validação.
---

A **propriedade string** é o tipo de campo mais versátil no FireCMS. Use-a para tudo, desde campos de texto simples até uploads de arquivos, editores de texto rico e dropdowns. Ao construir um **painel de administração** para sua aplicação **Firebase**, as propriedades string permitem criar:

- **Campos de texto**: Nomes, títulos, descrições
- **Dropdowns de seleção**: Campos de status, categorias, opções
- **Upload de arquivos**: Imagens, documentos (armazenados no **Firebase Storage**)
- **Editores markdown**: Conteúdo rico com formatação
- **Campos email/URL**: Tipos de entrada validados

```tsx
import { buildProperty } from "@firecms/core";

const nameProperty = buildProperty({
    name: "Name",
    description: "Basic string property with validation",
    validation: { required: true },
    dataType: "string"
});
```

### `storage`

Você pode especificar uma configuração `StorageMeta`. É usada para indicar que esta string refere-se a um caminho no Google Cloud Storage.

* `mediaType` Tipo de mídia desta referência, usado para exibir a pré-visualização.
* `acceptedFiles` [Tipo MIME](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) de arquivo que pode ser enviado para esta referência.
* `metadata` Metadados específicos definidos no arquivo enviado.
* `fileName` Personalizar o nome do arquivo enviado.
* `storagePath` Caminho absoluto no seu bucket.
* `includeBucketUrl` Quando `true`, o FireCMS armazenará uma URL de armazenamento completa.
* `storeUrl` Quando `true`, a URL de download do arquivo será salva no Firestore.
* `maxSize` Tamanho máximo do arquivo em bytes.
* `processFile` Callback para processar o arquivo antes do upload.
* `imageResize` (recomendado) Configuração avançada de redimensionamento de imagens.
* `imageCompression` (depreciado) Redimensionamento/compressão de imagens legado.

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    dataType: "string",
    storage: {
        mediaType: "image",
        storagePath: (context) => {
            return "images";
        },
        acceptedFiles: ["image/*"],
        fileName: (context) => {
            return context.file.name;
        },
        includeBucketUrl: true,
        imageResize: {
            maxWidth: 1200,
            maxHeight: 1200,
            mode: "cover",
            format: "webp",
            quality: 85
        }
    }
});
```

### `url`

Se o valor desta propriedade for uma URL, pode definir este flag como `true` para adicionar um link, ou um dos tipos de mídia suportados para renderizar uma pré-visualização.

### `email`

Se definido como `true`, este campo será validado como endereço de email.

### `userSelect`

Esta propriedade indica que a string é um **ID de utilizador**, e será renderizada como um seletor de utilizador.

### `enumValues`

Você pode usar os valores enum fornecendo um map de valores exclusivos possíveis que a propriedade pode assumir, mapeados para o rótulo exibido no dropdown.

### `multiline`

Se esta propriedade string for longa o suficiente para ser exibida em um campo multi-linha. Padrão false.

### `clearable`

Adiciona um ícone para limpar o valor e defini-lo como `null`. Padrão `false`

### `markdown`

Se esta propriedade string deve ser exibida como um campo markdown.

### `previewAsTag`

Se esta string deve ser renderizada como um tag em vez de texto simples.

### `validation`

* `required` Se este campo deve ser obrigatório.
* `requiredMessage` Mensagem a ser exibida como erro de validação.
* `unique` O valor deste campo deve ser único nesta coleção.
* `uniqueInArray` Se `true`, o utilizador só poderá ter o valor desta propriedade uma vez no `ArrayProperty` pai.
* `length` Definir um comprimento obrigatório para o valor string.
* `min` Definir um limite de comprimento mínimo.
* `max` Definir um limite de comprimento máximo.
* `matches` Fornecer uma regex arbitrária para verificar o valor.
* `email` Valida o valor como endereço de email.
* `url` Valida o valor como URL válida.
* `trim` Transforma valores string removendo espaços em branco no início e no fim.
* `lowercase` Transforma o valor string para minúsculas.
* `uppercase` Transforma o valor string para maiúsculas.

---

Com base na sua configuração, os widgets criados são:

- [`TextFieldBinding`](../../api/functions/TextFieldBinding) campo de texto genérico
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) se os `enumValues` estiverem definidos
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) configuração de armazenamento
- [`MarkdownEditorFieldBinding`](../../api/functions/MarkdownEditorFieldBinding) configuração markdown

Links:
- [API](../../api/interfaces/StringProperty)
