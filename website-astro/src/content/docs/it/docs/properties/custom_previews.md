---
title: Anteprime personalizzate
slug: it/docs/properties/custom_previews
sidebar_label: Anteprime personalizzate
description: In FireCMS, le anteprime personalizzate ti permettono di personalizzare come le proprietà vengono visualizzate in contesti read-only, come le viste collezione.
---

Ogni proprietà che definisci nel CMS ha un componente di anteprima associato per impostazione predefinita. In alcuni casi potresti voler costruire un componente di anteprima personalizzato.

Proprio come puoi personalizzare come il tuo campo proprietà viene renderizzato, puoi cambiare come l'anteprima di una proprietà viene **visualizzata nella collezione** e nelle altre **viste read-only**.

Puoi costruire la tua anteprima come componente React che prende [PropertyPreviewProps](../api/interfaces/PropertyPreviewProps) come props.

`PropertyPreviewProps` ha due tipi generici: il primo è il tipo della proprietà, come `string` o `boolean`, e il secondo (opzionale) è il tipo per qualsiasi prop personalizzata che vuoi passare all'anteprima, proprio come si fa quando si definiscono campi personalizzati.

### Esempio

Esempio di un'anteprima personalizzata per una proprietà `boolean`:

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

...e come viene utilizzata:

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
