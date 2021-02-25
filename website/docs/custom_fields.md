---
id: custom_fields
title: Custom fields
sidebar_label: Custom fields
---

If you need a custom field for your property you can do it by passing a React
component to the `field` prop of a property `config`. The React component must
accept the props of type `CMSFieldProps`. The bare minimum you need to implement is a field that displays the
received `value` and uses the `setValue` callback.

You can also specify your own props that are passed to your component in `customProps`

## Custom field props - CMSFieldProps

* `name` The name of the property, such as `age`. You can use nested and array
  indexed such as `address.street` or `people[3]`

* `property` The CMS property you are binding this field to

* `context` The context where this field is being rendered. You get a
  context as a prop when creating a custom field.

* `includeDescription` Should the description be included in this field

* `underlyingValueHasChanged` Has the value of this property been updated
  in the database while this field is being edited

* `tableMode` Is this field being rendered in a table

* `partOfArray` Is this field part of an array

* `autoFocus` Should the field take focus when rendered. When opening the
  popup view in table mode, it makes sense to put the focus on the only
  field rendered.

* `disabled` Should this field be disabled

* `dependsOnOtherProperties` This flag is used to avoid using Formik
  FastField internally, which prevents being updated from the values

You can also pass custom props to your custom field, which you then receive in
the `customProps`.

If you are developing a custom field and need to access the values of the
entity, you can use the `context` field in CMSFieldProps.

## Example

This is an example of a custom TextField that takes the background color as a prop

```tsx
import { TextField, Theme, withStyles } from "@material-ui/core";
import React, { ReactElement } from "react";
import { FieldDescription, FieldProps } from "@camberi/firecms";

interface CustomColorTextFieldProps {
    color: string
}

export const TextFieldWithStyles = withStyles((theme: Theme) => ({
    root: (props: any) => ({
        "& .MuiFilledInput-root": {
            backgroundColor: props.customcolor
        }
    })
}))(TextField);

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
                                             }: FieldProps<string, CustomColorTextFieldProps>)
    : ReactElement {

    return (
        <>
            <TextFieldWithStyles required={property.validation?.required}
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
                                 variant={"filled"}
                                 customcolor={customProps.color}/>

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
                field: CustomColorTextField,
                customProps: {
                    color: "gold"
                }
            }
        }
    }
});
```

## Custom previews
Just as you can customize how your property field is rendered, you can change
how the preview of a property is displayed in collection and other read only
views

Example of a custom preview for a `boolean` property:
```tsx
import React, { ReactElement } from "react";
import { PreviewComponentProps } from "@camberi/firecms";

import CheckBoxOutlineBlank from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxOutlined from "@material-ui/icons/CheckBoxOutlined";

export default function CustomBooleanPreview({
                                                 value, property, size
                                             }: PreviewComponentProps<boolean>)
    : ReactElement {
    return (
        value ? <CheckBoxOutlined/> : <CheckBoxOutlineBlank/>
    );
}
```

...and how it is used:

```tsx
export const blogSchema = buildSchema({
    name: "Blog entry",
    properties: {
        // ...
        reviewed: {
            title: "Reviewed",
            dataType: "boolean",
            config: {
                preview: CustomBooleanPreview
            }
        },
    }
});
```
