---
id: custom_fields
title: Custom fields
sidebar_label: Custom fields
---

If you need a custom field for your property you can do it by passing a React
component to the `Field` prop of a property `config`. The React component must
accept the props of type [`FieldProps`](../api/interfaces/fieldprops.md).
The bare minimum you need to implement
is a field that displays the received `value` and uses the `setValue` callback.

You can also pass custom props to your custom field, which you then receive in
the `customProps` prop.

If you are developing a custom field and need to access the values of the
entity, you can use the `context` field in FieldProps.

You can check all the props [`FieldProps`](../api/interfaces/fieldprops.md)

## Example

This is an example of a custom TextField that takes the background color as a prop

```tsx
import React from "react";
import { TextField, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { FieldDescription, FieldProps } from "dist/index";

interface CustomColorTextFieldProps {
    color: string
}

const useStyles = makeStyles<Theme, { customColor: string }>(() => ({
    root: ({ customColor }) => ({
        backgroundColor: customColor
    })
}));

export default function CustomColorTextField({
                                                 property,
                                                 value,
                                                 setValue,
                                                 customProps,
                                                 touched,
                                                 error,
                                                 isSubmitting,
                                                 context, // the rest of the entity values here
                                                 ...props
                                             }: FieldProps<string, CustomColorTextFieldProps>) {

    const classes = useStyles({ customColor: customProps.color });

    return (
        <>
            <TextField required={property.validation?.required}
                       classes={{
                           root: classes.root
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
                       helperText={error}
                       fullWidth
                       variant={"filled"}/>

            <FieldDescription property={property}/>
        </>

    );

}
```

...and how it is used:
```tsx
export const blogSchema = buildSchema({
    name: "Blog entry",
    properties: {
        // ...
        gold_text: {
            title: "Gold text",
            description: "This field is using a custom component defined by the developer",
            dataType: "string",
            config: {
                Field: CustomColorTextField,
                customProps: {
                    color: "gold"
                }
            }
        }
    }
});
```
