---
slug: docs/collections/additional_columns
title: Additional columns/fields
sidebar_label: Additional columns/fields
---


If you would like to include a column that does not map directly to a property,
you can use the `additionalFields` field, providing a
`AdditionalFieldDelegate`, which includes an id, a title, and a builder that
receives the corresponding entity.

In the builder you can return any React Component.

:::note
If your additional field depends on the value of another property of the entity
you can define the `dependencies` prop as an array of property keys so that
the data is always updated.
This will trigger a rerender whenever there is a change in any of the specified
property values.
:::

#### Example

```tsx
import {
    buildCollection,
    buildCollection,
    AdditionalFieldDelegate
} from "@firecms/core";

type User = { name: string }

export const fullNameAdditionalField: AdditionalFieldDelegate<User> = {
    key: "full_name",
    name: "Full Name",
    Builder: ({ entity }) => {
        let values = entity.values;
        return typeof values.name === "string" ? values.name.toUpperCase() : "No name provided";
    },
    dependencies: ["name"]
};

const usersCollection = buildCollection<User>({
    path: "users",
    name: "User",
    properties: {
        name: { dataType: "string", name: "Name" }
    },
    additionalFields: [
        fullNameAdditionalField
    ]
});
```

#### Advanced example

```tsx
import {
    buildCollection,
    AdditionalFieldDelegate,
    AsyncPreviewComponent
} from "@firecms/core";

export const productAdditionalField: AdditionalFieldDelegate<Product> = {
    key: "spanish_title",
    name: "Spanish title",
    Builder: ({ entity, context }) =>
        <AsyncPreviewComponent builder={
            context.dataSource.fetchEntity({
                path: entity.path,
                entityId: entity.id,
                collection: localeSchema
            }).then((entity) => entity.values.name)
        }/>
};
```

:::tip
`AsyncPreviewComponent` is a utility component provided by FireCMS that
allows you to render the result of an async computation (such as fetching data
from a subcollection, like in this case). It will display a skeleton loading
indicator in the meantime.
:::
