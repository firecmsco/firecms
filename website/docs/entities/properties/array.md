---
id: array
title: Array
sidebar_label: Array
---

##  `of`

The property of this array.

You can specify any property (except another Array property, since
Firestore does not support it)
You can leave this field empty only if you are providing a custom field or
provide a `oneOf` field otherwise an error will be thrown.

Example `of` array property:
```tsx
import { buildProperty } from "@camberi/firecms";

const productReferences = buildProperty({
    title: "Products",
    dataType: "array",
    of: {
        dataType: "reference",
            path: "products",
            previewProperties: ["name", "main_image"]
    }
});
```

##  `oneOf`

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
import { buildProperty } from "@camberi/firecms";

const contentProperty = buildProperty({
    title: "Content",
    description: "Example of a complex array with multiple properties as children",
    validation: { required: true },
    dataType: "array",
    oneOf: {
        title: "Content",
        description: "Example of a complex array with multiple properties as children",
        dataType: "array",
        oneOf: {
            typeField: "type",
            valueField: "value",
            properties: {
                title: {
                    title: "Title",
                    dataType: "string"
                },
                text: {
                    dataType: "string",
                    title: "Text",
                    config: {
                        markdown: true
                    }
                }
            }
        }
    }
});
```

## `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.
* `min` Set the minimum length allowed.
* `max` Set the maximum length allowed.

---

Based on your configuration the form field widgets that are created are:
- [`ArrayDefaultField`](api/functions/arraydefaultfield.md) generic array field that allows reordering and renders
  the child property as nodes.
- [`StorageUploadField`](api/functions/storageuploadfield.md) if the `of` property is a `string` with storage configuration.
- [`ArrayEnumSelect`](api/functions/arrayenumselect.md) if the `of` property is a `string` with an enum configuration.
- [`ArrayOfReferencesField`](api/functions/arrayofreferencesfield.md) if the `of` property is a `reference`
- [`ArrayOneOfField`](api/functions/arrayoneoffield.md) if the `oneOf` property is specified

Links:
- [API](api/interfaces/arrayproperty.md)

