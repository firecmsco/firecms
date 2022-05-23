---
id: selects 
title: Select fields
---

### Simple select field

You can use a simple select field when you would like allow the selection of a
single value among a limited set of options. Each entry will have a key and a
label. You can also customise the color of each entry or disable certain options.

Set the `enumValues` prop to a valid configuration in a string property. You can
define those values as an array
of [`EnumValueConfig`](../../api/interfaces/EnumValueConfig)
or simply as an object with key/value pairs:

```typescript jsx
import { buildProperty } from "@camberi/firecms";

buildProperty({
    dataType: "string",
    name: "Category",
    enumValues: {
        art_design_books: "Art and design books",
        backpacks: "Backpacks and bags",
        bath: "Bath",
        bicycle: "Bicycle",
        books: "Books"
    }
});
```

or

```typescript jsx
import { buildProperty } from "@camberi/firecms";

buildProperty({
    dataType: "string",
    name: "Currency",
    enumValues: [
        { id: "EUR", label: "Euros", color: "blueDark" },
        { id: "DOL", label: "Dollars", color: "greenLight" }
    ]
});
```

The data type is [`string`](../config/string) or [`number`](../config/number).

Internally the component used
is [`SelectFieldBinding`](../../api/functions/SelectFieldBinding).


### Multiple select field

You can use a multiple select field when you would like allow the selection of a
zero or more values among a limited set of options. Each entry will have a key
and a label. You can also customise the color of each entry or disable certain options.

Set the `enumValues` prop to a valid configuration in a string property. You can
define those values as an array
of [`EnumValueConfig`](../../api/interfaces/EnumValueConfig)
or simply as an object with key/value pairs:

```typescript jsx
import { buildProperty } from "@camberi/firecms";

buildProperty({
    name: "Available locales",
    dataType: "array",
    of: {
        dataType: "string",
        enumValues: {
            "es": "Spanish",
            "en": "English",
            "fr": {
                id: "fr",
                label: "French",
                disabled: true
            }
        }
    },
    defaultValue: ["es"]
},);
```

The data type is [`array`](../config/array) with either string or number
properties as the `of` prop, using enum values. 

Internally the component used
is [`SelectFieldBinding`](../../api/functions/SelectFieldBinding).

