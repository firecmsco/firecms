---
slug: types_refactor
title: Big types refactor
author: Francesco Gatti
image: /img/francesco_avatar.jpg
author_url: https://www.linkedin.com/in/fgatti675
author_image_url: https://avatars.githubusercontent.com/u/5120271?v=4
---

### Types update

We have a **big update in version 0.49.0** affecting the main types used in the
CMS.

The signature of `EntitySchema<Key extends string = string>` has changed to
`EntitySchema<M>` where `M` is your model type like:
```tsx
import { buildSchema } from "@camberi/firecms";

type Product = {
    name: string;
    price:number;
}

const productSchema = buildSchema<Product>({
    // ...
    properties:{
      name: {
        dataType: "string",
        // ...
      },
      // ...
    }
    // ...
});
```

This change propagates to all the rest of the types used internally and in
the public API, especially to all the types that had `EntitySchema` as a generic
type argument.

For example `EntityValues` (representing the data related to an entity) had the
signature `EntityValues<S extends EntitySchema<Key>, Key extends string>` and now
it is simply `EntityValues<M>`. You may use `EntityValues` or any other type
that includes a schema as a type if you have callbacks in place or have
implemented custom views.

This affects in an equal way all the types that are exported. In order to
migrate to the new version you need to make sure that you don't have any
references like `EntityCollection<typeof productSchema>`, like the ones we had
in the previous examples. In that case you can create your `Product` type if
you want better type checking or simply remove it.


### Motivation

Let's face it, the type system related to schemas until now was a mess.

It had become overcomplicated and was not providing enough type information
in the callbacks. Not it is much straightforward.

### Robustness

I have always found it annoying all the Javascript frameworks that use the
`module.exports` system for configuration. I find myself going always back
and fort from the IDE to their website to get the information I need, even if
I have an idea.

**Configuration as code with a strong type system is a whole other level.**

The new system is now able to tell you exactly what you are configuring wrong,
or suggest the props you are looking for. The following is a configuration
error because we are assigning the `multiline` config, which applies only to
strings, to a number property:
```
// ...
name: {
    dataType: "number",
    title: "Name",
    config: {
        multiline: true
    },
    validation: { required: true }
}
// ...
```

So it indicates a type error:
<img
    style={{maxWidth: "400px"}}
    src={require('../static/img/config_error.png').default}
    alt="Configuration error"
/>

### Migration examples

For example, if you had a callback including `EntityValues`, you would know the
property keys you had defined, but not the types.

```tsx
import { buildSchema } from "@camberi/firecms";

type Product = {
    name: string;
    price: number;
}

export const productSchema = buildSchema<Product>({
    name: "Product",
    onPreSave: ({
                    schema,
                    path,
                    id,
                    values,
                    status
                }) => {
        // Now values is of type `Product`
        console.log(values);
        return values;
    },

    properties: {
        name: {
            dataType: "string",
            title: "Name"
        },
        price: {
            dataType: "number",
            title: "Price"
        }
    }
});
```

With this update you get a complete type system in all your callbacks, which will
help prevent errors.


### Use without specifying the type

There is a way to get the same type validation without indicating the type
explicitly. You can wrap each property with `buildProperty` to get the same result

```tsx
import { buildSchema, buildProperty } from "@camberi/firecms";

export const productSchema = buildSchema({
    name: "Product",
    onPreSave: ({
                    schema,
                    path,
                    id,
                    values,
                    status
                }) => {
        // Now values is of type `{ name: string; price: number; }`, so
        // equivalent to the previous example
        console.log(values);
        return values;
    },

    properties: {
        name: buildProperty({
            dataType: "string",
            title: "Name"
        }),
        price: buildProperty({
            dataType: "number",
            title: "Price"
        })
    }
});
```

This way of building your schemas is not encouraged, but it may be useful for
simplifying your migration.

In case you need to retrieve the type of the schema you have created, we now include
a utility type called `InferSchemaType` that could be useful if you had code
like `buildCollection<typeof productSchema>`, which now would simply turn into
`buildCollection<InferSchemaType<typeof productSchema>>`

We know that it can be a bit frustrating to migrate code to a newer version and
fix breaking changes, but we are convinced that this is a change for the better,
making our life and our users easier 😉

### Affected types and methods
All the following types and methods have seen their types changed from
`<S extends EntitySchema<Key>, Key extends string> `to `<M>`

- EntityCollection
- AdditionalColumnDelegate
- PermissionsBuilder
- ExtraActionsParams
- FilterValues
- EntityCustomView
- EntityCustomViewParams
- EntitySaveProps
- EntityDeleteProps
- Entity
- EntityValues
- FieldProps
- FormContext
- CMSFormFieldProps
- Properties
- PropertyBuilderProps
- PropertyBuilder
- PropertyOrBuilder
- listenCollection
- fetchCollection
- fetchEntity
- listenEntity
- listenEntityFromRef
- createEntityFromSchema
- saveEntity

And some other components that are only used in advaced use cases.
