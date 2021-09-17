---
id: cms_config
title: CMS config
sidebar_label: CMS config
---

### Navigation and custom views

You have two main ways of creating views in FireCMS, either creating entity
collections that get mapped to CMS views, or create your own React views.

You can check all the possible configurations for defining [collections](collections.md)
and [entity schemas](entity_schemas.md) in their respective documents.

Otherwise, you can define your own [custom top level views](custom_top_level_views.md).

You can change the navigation based on the logged-in user, by using a `NavigationBuilder`
function which can be asynchronous.

By using an async `NavigationBuilder` you can also fetch some data in order to
build your schemas. Let's say you have a collection called `subscriptions` and would
like to use its ids as the enum values of a `string` property; you can fetch
them and then build the schema with them.

```tsx
import {
    // ...
    NavigationBuilder,
    NavigationBuilderProps
} from "@camberi/firecms";

// ...

const navigation: NavigationBuilder = async ({ user }: NavigationBuilderProps) => ({
    collections: [
        buildCollection({
            relativePath: "products",
            schema: productSchema,
            name: "Products"
        })
    ]
});
```

### Builder functions

FireCMS provides a set of **builder functions** that just return the input they
receive but are useful for using the features of the type system and validate
your schemas and properties at compile time.

* `buildNavigation`
* `buildCollection`
* `buildSchema`
* `buildProperties`
* `buildProperty`
* `buildProperty`
* `buildEnumValueConfig`


### Schema resolver

You may want to override the schema definition for particular entities. In
that case you can define a schema resolver in the CMSApp level.

```tsx
import { buildSchema, SchemaResolver } from "@camberi/firecms";

const customSchemaResolver: SchemaResolver = ({
                                                  entityId,
                                                  path
                                              }: {
    entityId?: string;
    path: string;
}) => {

    if (entityId === "B0017TNJWY" && path === "products") {
        const customProductSchema = buildSchema({
            name: "Custom product",
            properties: {
                name: {
                    title: "Name",
                    description: "This entity is using a schema overridden by a schema resolver",
                    validation: { required: true },
                    dataType: "string"
                }
            }
        });

        return { schema: customProductSchema };
    }
};
```

