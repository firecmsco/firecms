---
slug: pt/docs/collections/exporting_data
title: Exportação de dados
sidebar_label: Exportação de dados
---

Toda visualização de coleção é exportável por padrão e incluirá um botão para exportar os dados em formato `csv`.

Você pode desativar a funcionalidade de exportação definindo o parâmetro `exportable` na sua coleção como `false`.

Todas as colunas regulares são exportadas, mas não os campos adicionais que você configurou na sua visualização de coleção, pois eles podem ser construídos com qualquer componente React.

Se você precisa adicionar campos extras no seu arquivo de exportação, pode criá-los definindo um `ExportConfig` na sua prop `exportable`:

```tsx
import { ExportMappingFunction, buildCollection } from "@firecms/core";

export const sampleAdditionalExportColumn: ExportMappingFunction = {
    key: "extra",
    builder: async ({ entity }) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return "Additional exported value " + entity.id;
    }
};

const blogCollection = buildCollection({
    path: "blog",
    collection: blogCollection,
    name: "Blog",
    exportable: {
        additionalFields: [sampleAdditionalExportColumn]
    },
});
```
