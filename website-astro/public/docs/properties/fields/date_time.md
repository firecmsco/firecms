# Date/time fields

Use the date/time fields to allow users to set dates, saved as Firestore timestamps.

You can choose between using dates or date/time fields. 
Also you can create read-only fields that get updated automatically when 
entities are created or updated

The data type is [`date`](https://firecms.co/docs/config/date).

Internally the component used
is [`DateTimeFieldBinding`](https://firecms.co/docs/https://firecms.co/docs/api/functions/DateTimeFieldBinding).

#### Date field

![Field](/img/fields/Date.png)

```typescript jsx

buildProperty({
    dataType: "date",
    name: "Expiry date",
    mode: "date"
});
```

#### Date/time field

![Field](/img/fields/Date_time.png)

```typescript jsx

buildProperty({
    dataType: "date",
    name: "Arrival time",
    mode: "date_time"
});
```

#### Update on creation

```typescript jsx

buildProperty({
    dataType: "date",
    name: "Created at",
    autoValue: "on_create"
});
```

#### Update on update

```typescript jsx

buildProperty({
    dataType: "date",
    name: "Updated at",
    autoValue: "on_update"
});
```

