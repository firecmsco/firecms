---
id: number
title: Number
sidebar_label: Number
---

```tsx
import { buildProperty } from "./builders";

const rangeProperty = buildProperty({
    title: "Range",
    validation: {
        min: 0,
        max: 3
    },
    dataType: "number"
});
```


## `config`

### `enumValues`
You can use the enum values providing a map of possible
  exclusive values the property can take, mapped to the label that it is
  displayed in the dropdown.


```tsx
import { buildProperty } from "./builders";

const property = buildProperty({
    title: "Status",
    dataType: "number",
    config: {
        enumValues: new Map([
            ["-1", buildEnumValueConfig({
                label: "Lightly tense",
                color: "redLighter"
            })],
            ["0", buildEnumValueConfig({
                label: "Normal",
                color: "grayLight"
            })],
            ["1", buildEnumValueConfig({
                label: "Lightly relaxed",
                color: "blueLighter"
            })]
        ])
    }
});
```

## `validation`

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

The widget that gets created is
- [`TextField`](api/functions/textfield.md) generic text field
- [`Select`](api/functions/select.md) if `enumValues` are set in the string config, this field renders a select
  where each option is a colored chip.

Links:
- [API](api/interfaces/numberproperty.md)
