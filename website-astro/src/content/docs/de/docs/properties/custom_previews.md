---
slug: de/docs/properties/custom_previews
title: Benutzerdefinierte Vorschauen
sidebar_label: Benutzerdefinierte Vorschauen
description: In FireCMS ermöglichen benutzerdefinierte Vorschauen eine individuelle Darstellung von Eigenschaften in schreibgeschützten Kontexten wie Kollektionsansichten.
---

Jede Eigenschaft, die Sie im CMS definieren, hat standardmäßig eine zugeordnete Vorschauentomponente.
In einigen Fällen möchten Sie möglicherweise eine benutzerdefinierte Vorschaukomponente erstellen.

Genau wie Sie anpassen können, wie Ihr Eigenschaftsfeld gerendert wird, können Sie ändern,
wie die Vorschau einer Eigenschaft in der **Kollektion** und anderen **Nur-Lese-Ansichten** angezeigt wird.

Sie können Ihre Vorschau als React-Komponente erstellen, die
[PropertyPreviewProps](../api/interfaces/PropertyPreviewProps) als Props nimmt.

`PropertyPreviewProps` hat zwei generische Typen: der erste ist der Typ der
Eigenschaft, wie `string` oder `boolean`, und der zweite (optional) ist der
Typ für benutzerdefinierte Props, die Sie an die Vorschau übergeben möchten.

### Beispiel

Beispiel einer benutzerdefinierten Vorschau für eine `boolean`-Eigenschaft:

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

...und wie es verwendet wird:

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
