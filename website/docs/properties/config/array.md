---
id: array
title: Array
sidebar_label: Array
---

###  `of`

The property of this array.

You can specify any property (except another Array property, since
Firestore does not support it)
You can leave this field empty only if you are providing a custom field or
provide a `oneOf` field otherwise an error will be thrown.

Example `of` array property:
```tsx
import { buildProperty } from "@firecms/cloud";

const productReferences = buildProperty({
  name: "Products",
  dataType: "array",
  of: {
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
  }
});
```

#### tuple

You can also specify an array of properties to define a tuple:
```tsx
import { buildProperty } from "@firecms/cloud";

const tupleDates = buildProperty({
  name: "Date Range (Start to End)",
  dataType: "array",
  of: [
    {
      name: "Start Date",
      dataType: "date"
    },
    {
      name: "End Date",
      dataType: "date"
    }
  ]
});
```

### `oneOf`

Use this field if you would like to have an array of properties.
It is useful if you need to have values of different types in the same
array.
Each entry of the array is an object with the shape:
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```
Note that you can use any property so `value` can take any value (strings,
numbers, array, objects...)
You can customise the `type` and `value` fields to suit your needs.

An example use case for this feature may be a blog entry, where you have
images and text blocks using markdown.

Example of `oneOf` field:
```tsx
import { buildProperty } from "@firecms/cloud";

const contentProperty = buildProperty({
  name: "Content",
  description: "Example of a complex array with multiple properties as children",
  validation: { required: true },
  dataType: "array",
  oneOf: {
    typeField: "type",
    valueField: "value",
    properties: {
      name: {
        name: "Title",
        dataType: "string"
      },
      text: {
        dataType: "string",
        name: "Text",
        markdown: true
      }
    }
  }
});
```

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `min` Set the minimum length allowed.
* `max` Set the maximum length allowed.

---

Based on your configuration the form field widgets that are created are:
- [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding) generic array field that allows reordering and renders
  the child property as nodes.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) if the `of` property is a `string` with storage configuration.
- [`ArrayEnumSelectBinding`](../../api/functions/ArrayEnumSelectBinding) if the `of` property is a `string` with an enum configuration.
- [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding) if the `of` property is a `reference`
- [`BlockFieldBinding`](../../api/functions/BlockFieldBinding) if the `oneOf` property is specified

Links:
- [API](../../api/interfaces/arrayproperty)

