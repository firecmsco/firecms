---
slug: docs/properties/fields/switch
title: Switch
---

![Field](/img/fields/Switch.png)

Simple toggle for selecting `true` or `false` values.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

The data type is [`boolean`](/docs/properties/config/boolean).

Internally the component used
is [`SwitchFieldBinding`](/docs/api/functions/SwitchFieldBinding).

