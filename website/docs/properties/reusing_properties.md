---
id: reusing_properties
title: Reusing property configurations
---

:::tip
When you define a property config, you will be able to select it in
the collection editor
:::

FireCMS 3 introduced a new way of defining properties that allows you to reuse
them across different entities and collections.

In the main App config export you can define a `propertyConfigs` object that
contains all the configurations related to a property. This is an array of
`PropertyConfig` objects, which are defined as follows:

```typescript
export type PropertyConfig<T extends CMSType = any> = {

    /**
     * Key used to identify this property config.
     */
    key: string,

    /**
     * Name of this field type.
     * This is not the name of the property.
     */
    name: string;

    /**
     * Default config for the property.
     * This property or builder will be used as the base values for the resulting property.
     * You can also use a builder function to generate the base property.
     * You can use a builder function to generate the property based on the values or the path.
     * You can also define a custom Field as a React component to be used for this property.
     */
    property: PropertyOrBuilder<T>;

    /**
     * Optional icon to be used in the field selector.
     * Use a 24x24 component, in order not to break the layout.
     * Any FireCMS icon can be used.
     */
    Icon?: React.ComponentType;

    /**
     * CSS color, used only in some plugins like the field selector.
     * e.g. "#2d7ff9"
     */
    color?: string;

    /**
     * Description of this field type.
     */
    description?: string;

}
```

Note that you can use any of the existing builders or properties as a base for
your custom property. What you define in your property will be used as a base
for the resulting property (the user is still able to customize it).

### Example

Let's define a custom property that consists of a translations map object with different string values:

```typescript

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: [
        // ...
    ],
    propertyConfigs: [
        {
            name: "Translated string",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English"
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                },
            },
        }
    ]
};
```


