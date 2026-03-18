---
title: Boolean
slug: fr/docs/properties/config/boolean
sidebar_label: Boolean
description: Configuration des propriétés booléennes dans FireCMS, rendues comme des interrupteurs toggle.
---

```tsx
import { buildProperty } from "@firecms/core";

const availableProperty = buildProperty({
    name: "Available",
    dataType: "boolean"
});
```



### `validation`

* `required` Si ce champ doit être obligatoire.
* `requiredMessage` Message à afficher comme erreur de validation.

---

Le widget créé est
- [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding)  interrupteur booléen simple

Liens :
- [API](../../api/interfaces/BooleanProperty)
