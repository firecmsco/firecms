---
id: entity_views
title: Entity views
sidebar_label: Entity views
description: FireCMS introduces Entity Views, a feature providing unparalleled flexibility for your custom content management needs. Whether you're creating previews, web page visualizations, dashboards, form alterations, or any distinctive view, FireCMS's Entity Custom Views cater to your unique requirements. Simply define your custom React component and integrate it within your entity collection schema as an 'EntityCustomView'. For broader applications, register the view in the entity view registry through `FireCMSAppConfig` to make it accessible across different collections. These custom entity views are fundamental elements, offering a granule layer of customization and enhancing your CMS's extensibility for diverse implementations.
---

FireCMS offers default form and table fields for common use cases and also allows
overriding fields if you need a custom implementation, but that might be not
enough in certain cases, where you might want to have a full **custom view related
to one entity**.

Typical use cases for this are:
- **Preview** of an entity in a specific format.
- Checking how the data looks in a **web page**.
- Defining a **dashboard**.
- Modifying the state of the **form**.
- ... or any other custom view you might need.

When your entity view is defined you can add directly to the collection
or include it in the entity view registry.


### Defining an entity custom view

In order to accomplish that you can pass an array of `EntityCustomView`
to your schema. Like in this example:

```tsx
import React from "react";
import { EntityCustomView, buildCollection } from "@firecms/cloud";

const sampleView: EntityCustomView = {
    path: "preview",
    name: "Blog entry preview",
    Builder: ({ collection, entity, modifiedValues, formContext }) => (
        // This is a custom component that you can build as any React component
        <MyBlogPreviewComponent entity={entity}
                                modifiedValues={modifiedValues}/>
    )
};
```

### Add your entity view directly to the collection

If you are editing a collection in code you can add your custom view
directly to the collection:

```tsx
import { buildCollection } from "@firecms/cloud";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    views: [
        {
            path: "preview",
            name: "Blog entry preview",
            Builder: ({ collection, entity, modifiedValues }) => (
                // This is a custom component that you can build as any React component
                <MyBlogPreviewComponent entity={entity}
                                        modifiedValues={modifiedValues}/>
            )
        }
    ],
    properties: {
        // ... your blog properties here
    }
});
```

### Add your entity view to the entity view registry

You might have an entity view that you want to reuse in different collections.
In that case you can add it to the entity view registry in your 
main `FireCMSAppConfig` export:

```tsx
import { FireCMSAppConfig } from "@firecms/cloud";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... your collections here
        ]);
    },
    entityViews: [{
        key: "test-view",
        name: "Test",
        Builder: ({ collection, entity, modifiedValues }) => <div>Your view</div>
    }]
}

export default appConfig;
```

This will make the entity view available in the collection editor UI.
It is also possible to use the `entityView` prop in the collection
with the key of the entity view you want to use:

```tsx
import { buildCollection } from "@firecms/cloud";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    views: ["test-view"],
    properties: {
        // ... your blog properties here
    }
});

```

