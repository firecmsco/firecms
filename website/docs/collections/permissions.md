---
id: permissions
title: Permissions
sidebar_label: Permissions
---

You can define the `edit`, `create` and `delete` permissions at the collection
level, also depending on the logged-in user.

In the simpler case, you can directly assign the permissions

```tsx
import { buildCollection } from "@camberi/firecms";

buildCollection({
    path: "products",
    schema: productSchema,
    name: "Products",
    permissions: {
        edit: true,
        create: true,
        delete: false
    }
});
```

```tsx
import { buildCollection } from "@camberi/firecms";

buildCollection({
    path: "products",
    schema: productSchema,
    name: "Products",
    permissions: ({ user }) => ({
        edit: true,
        create: true,
        delete: true
    })
});
```

