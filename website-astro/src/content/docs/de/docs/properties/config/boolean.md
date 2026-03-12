---
slug: de/docs/properties/config/boolean
title: Boolean
sidebar_label: Boolean
description: Konfiguration für Boolean-Eigenschaften in FireCMS, als Schalter gerendert.
---

```tsx
import { buildProperty } from "@firecms/core";

const availableProperty = buildProperty({
    name: "Available",
    dataType: "boolean"
});
```

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.

---

Links:
- [API](../../api/interfaces/BooleanProperty)
