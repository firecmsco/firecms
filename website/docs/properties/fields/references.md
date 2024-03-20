---
id: references 
title: References
---

Use reference fields when you need to establish relations between collections.
For example, you may have a product that is related to one category, or one 
that has multiple purchases.

When you set up a FireCMS app, you define collections under paths (or path
aliases), and those are the paths that you use to configure reference 
properties.

### Single reference field

![Field](/img/fields/Reference.png)

```typescript jsx
import { buildProperty } from "@firecms/cloud";

buildProperty({
    dataType: "reference",
    path: "users",
    name: "Related client",
});
```

The data type is [`reference`](../config/reference)

Internally the component used
is [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding).


### Multiple reference field

![Field](/img/fields/Multi_reference.png)

```typescript jsx
import { buildProperty } from "@firecms/cloud";

buildProperty({
    dataType: "array",
    name: "Related products",
    of: {
        dataType: "reference",
        path: "products"
    }
});
```

The data type is [`array`](../config/array) with a reference
property as the `of` prop. 

Internally the component used
is [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding).

