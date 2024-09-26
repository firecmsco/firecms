---
id: entity_views
title: Entity views
sidebar_label: Entity views
description: FireCMS allows you to add custom view per entity. Whether you're creating previews, web page visualizations, dashboards, form alterations, or any distinctive view, FireCMS's Entity Custom Views cater to your unique requirements. Simply define your custom React component and integrate it within your entity collection schema as an 'EntityCustomView'. For broader applications, register the view in the entity view registry through `FireCMSAppConfig` to make it accessible across different collections. These custom entity views are fundamental elements, offering a granule layer of customization and enhancing your CMS's extensibility for diverse implementations.
---

![Custom entity view](/img/entity_view.png)

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
import { EntityCustomView, buildCollection } from "@firecms/core";

const sampleView: EntityCustomView = {
    key: "preview",
    name: "Blog entry preview",
    Builder: ({
                  collection,
                  entity,
                  modifiedValues,
                  formContext
              }) => (
        // This is a custom component that you can build as any React component
        <MyBlogPreviewComponent entity={entity}
                                modifiedValues={modifiedValues}/>
    )
};
```

### Building a secondary form

![Custom entity view](/img/entity_view_secondary_form.png)

In your custom views, you can also add fields that are mapped directly to the entity.
This is useful if you want to add a secondary form to your entity view.

You can add any field, by using the `PropertyFieldBinding` component. This component
will bind the value to the entity, and it will be saved when the entity is saved.

In this example we creating a secondary form with a map field, including name and age:

```tsx
import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container } from "@firecms/ui";

export function SecondaryForm({
                                  formContext
                              }: EntityCustomViewParams) {

    return (
        <Container className={"my-16"}>
            <PropertyFieldBinding context={formContext}
                                  propertyKey={"myTestMap"}
                                  property={{
                                      dataType: "map",
                                      name: "My test map",
                                      properties: {
                                          name: {
                                              name: "Name",
                                              dataType: "string",
                                              validation: { required: true }
                                          },
                                          age: {
                                              name: "Age",
                                              dataType: "number",
                                          }
                                      }
                                  }}/>
        </Container>
    );
}
```

Then just add your custom view to the collection:

```tsx
export const testCollection = buildCollection<any>({
    id: "users",
    path: "users",
    name: "Users",
    properties: {
        // ... your blog properties here
    },
    entityViews: [{
        key: "user_details",
        name: "Details",
        includeActions: true, // this prop allows you to include the default actions in the bottom bar
        Builder: SecondaryForm
    }]
});
```

Note that you can use the `includeActions` prop to include the default actions in the bottom bar, of the view,
so the user doesn't need to go back to the main form view to perform actions like saving or deleting the entity.


### Add your entity view directly to the collection

If you are editing a collection in code you can add your custom view
directly to the collection:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: [
        {
            path: "preview",
            name: "Blog entry preview",
            Builder: ({
                          collection,
                          entity,
                          modifiedValues
                      }) => (
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

#### FireCMS Cloud

In FireCMS Cloud, you can add it to the entity view registry in your
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
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Your view</div>
    }]
}

export default appConfig;
```

#### FireCMS PRO

In FireCMS PRO, you can add it to the entity view registry in your main
`FireCMS` component:

```tsx
//...
<FireCMS
    //...
    entityViews={[{
        key: "test-view",
        name: "Test",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Your view</div>
    }]}
    //...
/>
```

#### Using registered view

This will make the entity view available in the collection editor UI.
It is also possible to use the `entityView` prop in the collection
with the key of the entity view you want to use:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: ["test-view"],
    properties: {
        // ... your blog properties here
    }
});
```

