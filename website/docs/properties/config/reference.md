---
id: reference
title: Reference
sidebar_label: Reference
---

```tsx
import { buildProperty } from "./builders";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
});
```

### `path`

Absolute collection path of the collection this reference
points to. The schema of the entity is inferred based on the root navigation,
so the filters and search delegate existing there are applied to this view as
well.

### `previewProperties`

List of properties rendered as this reference preview.
Defaults to first 3.

### `forceFilter`

Force a filter in the reference selection. If applied, the rest of the filters
will be disabled. Filters applied with this prop cannot be changed.
e.g. `forceFilter: { age: [">=", 18] }`

### `validation`

* `required` Should this field be compulsory.
* `requiredMessage` Message to be displayed as a validation error.

### `defaultValue`

Default value for this property.
You can set the default value by defining an EntityReference:

```tsx

import { buildProperty } from "./builders";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    defaultValue: new EntityReference("B000P0MDMS", "products")
});
```

---

The widget that gets created is

- [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding) Field
  that opens a
  reference selection dialog

Links:

- [API](../../api/interfaces/referenceproperty)
