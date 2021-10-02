---
id: timestamp
title: Timestamp
sidebar_label: Timestamp
---

```tsx
import { buildProperty } from "./builders";

const publicationProperty = buildProperty({
    title: "Publication date",
    dataType: "timestamp"
});
```
## `autoValue` "on_create" | "on_update"

Used this prop to update this timestamp automatically upon entity creation
or update.

## `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `min` Set the minimum date allowed.
* `max` Set the maximum date allowed.

---

The widget that gets created is
- [`DateTimeField`](api/functions/datetimefield.md) Field that allows selecting a date

Links:
- [API](api/interfaces/timestampproperty.md)
