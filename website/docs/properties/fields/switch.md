---
id: switch
title: Switch
---

![Field](/img/fields/Switch.png)

Simple toggle for selecting `true` or `false` values.

```typescript jsx
import { buildProperty } from "@firecms/cloud";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

The data type is [`boolean`](../config/boolean).

Internally the component used
is [`SwitchFieldBinding`](../../api/variables/SwitchFieldBinding).

