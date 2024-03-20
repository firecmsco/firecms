---
id: repeat
title: Repeat
---

![Field](/img/fields/Repeat.png)

You can use a repeat field when you want to save multiple values in a property.
For example, you may want to save multiple pieces of text, like tags.

Please note that if you use an `array` property which uses an `of` prop, the
resulting field may be one of the specialized ones (such as select, file
upload or reference field). The repeat field will be used in the rest of cases.

This fields allows reordering of its entries.

This component can be expanded or collapsed by default.

```typescript jsx
import { buildProperty } from "@firecms/cloud";

buildProperty({
    dataType: "array",
    name: "Tags",
    of: {
        dataType: "string",
        previewAsTag: true
    },
    expanded: true
});
```

The data type is [`array`](../config/array).

Internally the component used
is [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding).

