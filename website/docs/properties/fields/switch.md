---
id: switch
title: Switch
---

Simple toggle for selecting `true` or `false` values.

```typescript jsx
import { buildProperty } from "@camberi/firecms";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

The data type is [`boolean`](../config/boolean).

Internally the component used
is [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding).

