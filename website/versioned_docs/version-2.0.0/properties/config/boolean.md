---
id: boolean
title: Boolean
sidebar_label: Boolean
---

```tsx
import { buildProperty } from "./builders";

const availableProperty = buildProperty({
    name: "Available",
    dataType: "boolean"
});
```



### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.

---

The widget that gets created is
- [`SwitchFieldBinding`]  simple boolean switch

Links:
- [API]
