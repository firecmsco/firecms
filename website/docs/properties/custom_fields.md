---
id: custom_fields
title: Custom fields
sidebar_label: Custom fields
description: FireCMS custom fields elevate your forms with bespoke elements tailored precisely to your needs. By incorporating a React component into a property's `propertyConfig`, you gain full control over the field's rendering and logic. Minimum requirements include displaying `value` and employing `setValue` to update the property. Conveniently, custom props can be defined and received within your field component, and for more complex scenarios, the `context` within FieldProps provides access to the entity's full values. The example illustrates a custom TextField influenced by a background color prop, showcasing the flexibility and creativity allowed by custom fields. These personalized inputs are integral for crafting a content management system that aligns perfectly with your unique project requirements.
---

Custom fields allow you to customize the field that it is displayed in the 
form, related to a specific property. These fields use your own logic to 
render the corresponding view, and are responsible for updating the underlying
property value.

If you need a custom field for your property you can do it by passing a React
component to the `propertyConfig` prop of a property `config`. The React component must
accept the props of type [`FieldProps`](../api/interfaces/fieldprops).
The bare minimum you need to implement
is a field that displays the received `value` and uses the `setValue` callback.

You can also pass custom props to your custom field, which you then receive in
the `customProps` prop.

If you are developing a custom field and need to access the values of the
entity, you can use the `context` field in FieldProps.

You can check all the props [`FieldProps`](../api/interfaces/fieldprops).


## Example

This is an example of a custom TextField that takes the background color as a prop

```tsx

import React from "react";
import { TextField } from "@mui/material";
import { FieldProps } from "@firecms/cloud";

interface CustomColorTextFieldProps {
    color: string
}

export default function CustomColorTextField({
                                                 property,
                                                 value,
                                                 setValue,
                                                 setFieldValue, // use this function to update a different field
                                                 customProps,
                                                 touched,
                                                 error,
                                                 isSubmitting,
                                                 context, // the rest of the entity values here
                                                 ...props
                                             }: FieldProps<string, CustomColorTextFieldProps>) {

    return (
        <>
            <TextField required={property.validation?.required}
                       sx={{
                           backgroundColor: customProps.color
                       }}
                       error={!!error}
                       disabled={isSubmitting}
                       label={property.title}
                       value={value ?? ""}
                       onChange={(evt: any) => {
                           setValue(
                               evt.target.value
                           );
                       }}
                       fullWidth
                       variant={"filled"}/>


            <TFormHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>
        </>

    );

}
```

...and how it is used:
```tsx
export const blogCollection = buildCollection({
    name: "Blog entry",
    properties: {
        // ...
        gold_text: {
            name: "Gold text",
            description: "This field is using a custom component defined by the developer",
            dataType: "string",
            Field: CustomColorTextField,
            customProps: {
                color: "gold"
            }
        }
    }
});
```
