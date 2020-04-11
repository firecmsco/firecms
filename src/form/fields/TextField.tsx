import { NumberProperty, StringProperty } from "../../models";
import { Field, getIn } from "formik";
import {
    FormControl,
    FormHelperText,
    Input,
    InputLabel
} from "@material-ui/core";
import React from "react";

interface TextFieldProps {
    name: string,
    property: StringProperty | NumberProperty,
    includeDescription: boolean,
}

export default function TextField({ name, property, includeDescription }: TextFieldProps) {

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
                    <FormControl
                        required={property.validation?.required}
                        error={showError}
                        disabled={disabled !== undefined ? disabled : isSubmitting}
                        fullWidth>
                        <InputLabel>{property.title || name}</InputLabel>
                        <Input
                            type={property.dataType === "number" ? "number" : undefined}
                            value={value}
                            onChange={(evt) => setFieldValue(
                                name,
                                evt.target.value
                            )}
                        />
                        {showError && <FormHelperText
                            id="component-error-text">{fieldError}</FormHelperText>}
                        {includeDescription && property.description &&
                        <FormHelperText>{property.description}</FormHelperText>}
                    </FormControl>
                );
            }}
        </Field>
    );

}
