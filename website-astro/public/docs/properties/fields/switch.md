# Switch

![Field](https://firecms.co/img/fields/Switch.png)

Simple toggle for selecting `true` or `false` values.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

The data type is [`boolean`](https://firecms.co/docs/properties/config/boolean).

Internally the component used
is [`SwitchFieldBinding`](https://firecms.co/docs/api/functions/SwitchFieldBinding).


