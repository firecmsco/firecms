---
id: date_time
title: Date/time fields
---

Use the date/time fields to allow users to set dates, saved as timestamps.

You can choose between using dates or date/time fields. 
Also you can create read-only fields that get updated automatically when 
entities are created or updated

The data type is [`date`](../config/date).

Internally the component used
is [`DateTimeFieldBinding`].

#### Date field

![Field](/img/fields/Date.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Expiry date",
    mode: "date"
});
```

#### Date/time field

![Field](/img/fields/Date_time.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Arrival time",
    mode: "date_time"
});
```

#### Update on creation

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Created at",
    autoValue: "on_create"
});
```

#### Update on update

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Updated at",
    autoValue: "on_update"
});
```
