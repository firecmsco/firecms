---
id: custom_views
title: Custom views
sidebar_label: Custom views
---

For custom views you can define the following props:
* `path` string | string[]

  CMS Path (or paths) you can reach this view from.
  If you include multiple paths, only the first one will be included in the
  main menu

* `name`: string

  Name of this view

* `description`?: string

  Optional description of this view. You can use Markdown

* `hideFromNavigation`?: boolean

  Should this view be hidden from the main navigation panel.
  It will still be accessible if you reach the specified path

* `view`: React.ReactNode

  Component to be rendered

* `group`?: string

  Optional field used to group top level navigation entries under a
  navigation view.

A quick example for a custom view:

```tsx
export function App() {

    const productSchema = buildSchema({
        name: "Product",
        properties: {
            name: {
                title: "Name",
                validation: { required: true },
                dataType: "string"
            }
        }
    });

    const customViews: CMSView[] = [{
        path: ["additional", "additional/:id"],
        name: "Additional view",
        description: "This is an example of an additional view that is defined by the user",
        view: <ExampleCMSView/>
    }];

    const navigation: NavigationBuilder = ({ user }: NavigationBuilderProps) => ({
        collections: [
            buildCollection({
                relativePath: "products",
                schema: productSchema,
                name: "Products"
            })
        ]
    });

    return <CMSApp
        name={"My Online Shop"}
        navigation={navigation}
        firebaseConfig={firebaseConfig}
    />;
}
```

The code for the sample implemented view can be found [here](https://github.com/Camberi/firecms/blob/master/example/src/SampleApp/ExampleCMSView.tsx)


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

Additionally, if you have defined your models as Typescript types, you can
use this function to validate them (only the property names):
* `buildSchemaFrom<YOUR_TYPE>`

## More granular control

If you don't want to use FireCMS `CMSApp` as a full app but would like to
integrate some of its components you may want to use the `CMSAppProvider`
and `CMSMainView`
components (used internally) directly.

This will allow you to initialise Firebase on your own and integrate the FireCMS
components into your own app. Just place `CMSAppProvider` on top of the
components that need to use the FireCMS hooks.

You can see an
example [here](https://github.com/Camberi/firecms/blob/master/example/src/SimpleAppWithProvider.tsx)

