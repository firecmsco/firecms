import { TimestampProperty } from "../../models";
import { Field, getIn } from "formik";
import React from "react";
import { DateTimePicker } from "@material-ui/pickers";

interface DateTimeFieldProps {
    name: string,
    property: TimestampProperty,
    includeDescription: boolean,
}

export default function DateTimeField({ name, property, includeDescription }: DateTimeFieldProps) {

    return (
        <Field
            required={property.validation?.required}
            name={`${name}`}
        >
            {({
                  disabled,
                  field,
                  form: { isSubmitting, errors, touched, setFieldValue },
                  ...props
              }: any) => {

                const fieldError = getIn(errors, field.name);
                const showError = getIn(touched, field.name) && !!fieldError;

                const value = field.value;
                return (
                    <DateTimePicker
                        fullWidth
                        clearable
                        value={value}
                        label={property.title || name}
                        error={showError}
                        disabled={disabled !== undefined ? disabled : isSubmitting}
                        helperText={showError ? fieldError : props.helperText}
                        onChange={(dateValue) => setFieldValue(
                            name,
                            dateValue
                        )}
                    />
                );
            }}
        </Field>

    );
}
