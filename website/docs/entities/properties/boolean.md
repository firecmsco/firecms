---
id: boolean
title: Boolean
sidebar_label: Boolean
---

```tsx
import { buildProperty } from "./builders";

const availableProperty = buildProperty({
    title: "Available",
    dataType: "boolean"
});
```



## `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.

---

The widget that gets created is
- `SwitchField` simple boolean switch

Links:
- [API](api/interfaces/booleanproperty.md)
