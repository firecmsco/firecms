---
id: navigation
title: Navigation
sidebar_label: Navigation
---

FireCMS takes care of the navigation for you, it generates routes and menus based
on the configuration that you set up.

You have two main ways of creating the top level views in FireCMS, either creating entity
collections that get mapped to CMS views, or create your own top level React views.

You can check all the possible configurations for defining [collections](collections/collections.md)
and [entity schemas](entities/entity_schemas.md) in their respective documents.

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
            path: "products",
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



