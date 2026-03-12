---
slug: de/docs/properties/fields/key_value
title: Schlüssel/Wert
---

![Field](/img/fields/KeyValue.png)

Schlüssel/Wert ist ein spezielles Feld, das es Ihnen ermöglicht, beliebige Schlüssel-Wert-Paare einzugeben.
Sie können Strings als Schlüssel und jeden primitiven Typ als Wert verwenden (einschließlich Maps und Arrays).

Setzen Sie `dataType` auf `map` und `keyValue` auf `true`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "map",
    name: "Key value",
    keyValue: true
});
```

Der Datentyp ist [`map`](../config/map).
