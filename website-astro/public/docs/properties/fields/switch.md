# Switch

![Field](/img/fields/Switch.png)

Simple toggle for selecting `true` or `false` values.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

The data type is [`boolean`](https://firecms.co/docs/config/boolean).

Internally the component used
is [`SwitchFieldBinding`](https://firecms.co/docs/https://firecms.co/docs/api/functions/SwitchFieldBinding).


