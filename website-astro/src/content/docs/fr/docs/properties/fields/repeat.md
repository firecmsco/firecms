---
title: Répéter (Repeat)
---

![Field](/img/fields/Repeat.png)

Vous pouvez utiliser un champ de répétition lorsque vous souhaitez sauvegarder plusieurs valeurs dans une propriété. Par exemple, vous voudrez peut-être sauvegarder plusieurs morceaux de texte, comme des étiquettes (tags).

Veuillez noter que si vous utilisez une propriété `array` qui utilise une prop `of`, le champ résultant peut être l'un des spécialisés (comme la sélection, le téléversement de fichiers ou le champ de référence). Le champ de répétition sera utilisé dans les autres cas.

Ce champ permet la réorganisation de ses entrées.

Ce composant peut être développé ou réduit par défaut.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Tags",
    of: {
        dataType: "string",
        previewAsTag: true
    },
    expanded: true,
    sortable: true, // par défaut true
    canAddElements: true, // par défaut true
});
```

Le type de données est [`array`](../config/array).

En interne, le composant utilisé est [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding).
