---
title: Aperçus personnalisés
slug: fr/docs/properties/custom_previews
sidebar_label: Aperçus personnalisés
description: Dans FireCMS, les aperçus personnalisés donnent vie à votre CMS en vous permettant de personnaliser la façon dont les propriétés sont affichées dans les contextes en lecture seule, comme les vues de collection.
---

Chaque propriété que vous définissez dans le CMS a un composant d'aperçu associé par défaut. Dans certains cas, vous pourriez vouloir créer un composant d'aperçu personnalisé.

Tout comme vous pouvez personnaliser la façon dont votre champ de propriété est rendu, vous pouvez changer la façon dont l'aperçu d'une propriété est **affiché dans la collection** et dans d'autres **vues en lecture seule**.

Vous pouvez créer votre aperçu en tant que composant React qui prend [PropertyPreviewProps](../api/interfaces/PropertyPreviewProps) comme props.

`PropertyPreviewProps` a deux types génériques : le premier est le type de la propriété, comme `string` ou `boolean`, et le second (optionnel) est le type pour tous les props personnalisées que vous souhaitez passer à l'aperçu, comme c'est fait lors de la définition de champs personnalisés.

### Exemple
Exemple d'un aperçu personnalisé pour une propriété `boolean` :

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

...et comment il est utilisé :

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
