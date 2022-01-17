import React from "react";

import { Field, FieldProps as FormikFieldProps, getIn } from "formik";
import { TextField } from "@mui/material";

export function StringPropertyField({
                                        propertyPath,
                                        widgetId
                                    }: { propertyPath: string, widgetId: "text_field" | "multiline" | "markdown" | "url" | "email" }) {
    return (
        <Field
            required={true}
            name={`${propertyPath}.title`}
        >
            {(fieldProps: FormikFieldProps) => {

                const name = fieldProps.field.name;
                const value = fieldProps.field.value;
                const initialValue = fieldProps.meta.initialValue;
                const error = getIn(fieldProps.form.errors, name);
                const touched = getIn(fieldProps.form.touched, name);

                return <TextField value={value}
                                  label={"Title"}
                                  name={name}
                                  fullWidth
                                  onChange={fieldProps.field.onChange}/>;
            }}
        </Field>
    );
}
