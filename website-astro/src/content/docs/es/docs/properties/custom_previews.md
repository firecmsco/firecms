---
title: Vistas previas personalizadas
slug: es/docs/properties/custom_previews
sidebar_label: Vistas previas personalizadas
description: En FireCMS, las vistas previas personalizadas infunden vida a tu CMS al permitirte personalizar cómo se muestran las propiedades en contextos de solo lectura, como las vistas de colección. Crea cada vista previa con un componente React único que aproveche `PropertyPreviewProps`, admitiendo tanto el tipo de propiedad como cualquier accesorio (prop) personalizado adicional. El ejemplo muestra una vista previa de propiedad booleana a medida que utiliza íconos distintos para los estados verdadero o falso, lo que hace que la interpretación de los datos sea instantánea e intuitiva. La implementación de este tipo de vistas previas personalizadas le permite alinear la representación visual de sus datos con las necesidades y la marca específicas de su proyecto, brindando una experiencia de CMS más atractiva e informativa.
---

Cada propiedad que defina en el CMS tiene un componente de vista previa asociado de forma
predeterminada. En algunos casos, es posible que desee crear un componente de vista previa personalizado.

Al igual que puede personalizar cómo se representa el campo de su propiedad, puede cambiar
cómo se **muestra la vista previa de una propiedad en la colección** y otras **vistas de solo
lectura**.

Puede construir su vista previa como un componente de React que tome
[PropertyPreviewProps](../api/interfaces/PropertyPreviewProps) como props (propiedades).

`PropertyPreviewProps` tiene dos tipos genéricos: el primero es el tipo de la
propiedad, como `string` o `boolean`, y el segundo (opcional) es el
tipo para cualquier prop personalizado que le gustaría pasar a la vista previa, tal como
se hace al definir campos personalizados.

### Ejemplo
Ejemplo de una vista previa personalizada para una propiedad `boolean` (booleana):

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

...y cómo se usa:

```tsx
export const blogCollection = buildCollection({
    name: "Entrada de blog",
    properties: {
        // ...
        reviewed: {
            name: "Revisado",
            dataType: "boolean",
            Preview: CustomBooleanPreview
        },
    }
});
```
