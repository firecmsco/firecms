---
id: number
title: Number
sidebar_label: Number
---

```tsx
import { buildProperty } from "./builders";

const rangeProperty = buildProperty({
    name: "Range",
    validation: {
        min: 0,
        max: 3
    },
    dataType: "number"
});
```

### `clearable`
Add an icon to clear the value and set it to `null`. Defaults to `false`


### `enumValues`
You can use the enum values providing a map of possible
  exclusive values the property can take, mapped to the label that it is
  displayed in the dropdown.


```tsx
import { buildProperty } from "./builders";

const property = buildProperty({
    name: "Status",
    dataType: "number",
    enumValues: [
      buildEnumValueConfig({
        id: "-1",
        label: "Lightly tense",
        color: "redLighter"
      }),
      buildEnumValueConfig({
        id: "0",
        label: "Normal",
        color: "grayLight"
      }),
      buildEnumValueConfig({
        id: "1",
        label: "Lightly relaxed",
        color: "blueLighter"
      })
    ]
});
```

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `min` Set the minimum value allowed.
* `max` Set the maximum value allowed.
* `lessThan` Value must be less than.
* `moreThan` Value must be more than.
* `positive` Value must be a positive number.
* `negative` Value must be a negative number.
* `integer` Value must be an integer.


---

The widgets that get created are
- [`TextFieldBinding`](../../api/functions/TextFieldBinding) generic text field
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) if `enumValues` are set in the string config, this field renders a select
  where each option is a colored chip.

Links:
- [API](../../api/interfaces/numberproperty)
