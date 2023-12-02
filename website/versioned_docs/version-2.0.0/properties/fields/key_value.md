---
id: key_value
title: Key/Value
---

![Field](/img/fields/KeyValue.png)

Key/Value is a special field that allows you to input arbitrary key/value pairs.
You are able to use string as keys and any primitive type as value (including maps
and arrays).

To enable this widget, simply set the `dataType` to `map`, and the `keyValue` property
to `true`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "map",
    name: "Key value",
    keyValue: true
});
```

The data type is [`map`](../config/map).

Internally the component used
is [`KeyValueFieldBinding`].

