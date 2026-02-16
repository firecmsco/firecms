---
slug: docs/properties/config/boolean
title: Boolean
sidebar_label: Boolean
description: Configuration for boolean properties in FireCMS, rendered as toggle switches.
---

```tsx
import { buildProperty } from "@firecms/core";

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
- [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding)  simple boolean switch

Links:
- [API](../../api/interfaces/BooleanProperty)
