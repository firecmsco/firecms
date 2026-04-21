# Date/Time

```tsx

const publicationProperty = buildProperty({
    name: "Publication date",
    dataType: "date"
});
```
### `autoValue` "on_create" | "on_update"

Use this prop to update this date automatically upon entity creation
or update.

### `mode` "date" | "date_time"

Set the granularity of the field to a date, or date + time.
Defaults to `date_time`.

### `clearable`
Add an icon to clear the value and set it to `null`. Defaults to `false`

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `min` Set the minimum date allowed.
* `max` Set the maximum date allowed.

---

The widget that gets created is
- [`DateTimeFieldBinding`](https://firecms.co/docs/https://firecms.co/docs/api/functions/DateTimeFieldBinding) Field that allows selecting a date

Links:
- [API](https://firecms.co/docs/https://firecms.co/docs/api/interfaces/DateProperty)

