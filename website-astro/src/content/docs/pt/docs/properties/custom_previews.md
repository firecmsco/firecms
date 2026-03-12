---
slug: pt/docs/properties/custom_previews
title: Prévias personalizadas
sidebar_label: Prévias personalizadas
description: No FireCMS, as prévias personalizadas dão vida ao seu CMS, permitindo personalizar como as propriedades são exibidas em contextos somente leitura, como views de coleção.
---

Cada propriedade que você define no CMS tem um componente de prévia associado por
padrão. Em alguns casos, você pode querer construir um componente de prévia personalizado.

Assim como você pode personalizar como o campo da sua propriedade é renderizado, pode alterar
como a prévia de uma propriedade é **exibida na coleção** e em outras **views somente leitura**.

Você pode construir sua prévia como um componente React que recebe
[PropertyPreviewProps](../api/interfaces/PropertyPreviewProps) como props.

`PropertyPreviewProps` possui dois tipos genéricos: o primeiro é o tipo da
propriedade, como `string` ou `boolean` e o segundo (opcional) é o
tipo para quaisquer props personalizadas que você deseja passar para a prévia, assim como
feito ao definir campos personalizados.

### Exemplo
Exemplo de uma prévia personalizada para uma propriedade `boolean`:

```tsx
import React from "react";
import { PropertyPreviewProps } from "@firecms/core";
import { CheckBoxIcon, CheckBoxOutlineBlankIcon } from "@firecms/ui";

export default function CustomBooleanPreview({
                                                    value, property, size
                                                }: PropertyPreviewProps<boolean>
)
{
    return (
        value ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>
    );
}
```

...e como é usado:

```tsx
export const blogCollection = buildCollection({
    name: "Blog entry",
    properties: {
        // ...
        reviewed: {
            name: "Reviewed",
            dataType: "boolean",
            Preview: CustomBooleanPreview
        },
    }
});
```
