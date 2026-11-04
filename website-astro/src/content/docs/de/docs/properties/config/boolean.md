---
title: Boolean
slug: de/docs/properties/config/boolean
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

Das erstellte Widget ist
- [`SwitchFieldBinding`](/de/docs/api/functions/SwitchFieldBinding)  einfacher boolescher Schalter

Links:
- [API](/de/docs/api/interfaces/BooleanProperty)
