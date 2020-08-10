import { getIn } from "formik";
import {
    FormControl,
    FormHelperText,
    Input,
    InputLabel
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { CMSFieldProps, FieldDescription } from "@camberi/firecms";

interface CustomColorTextFieldProps extends CMSFieldProps<string> {
    color: string
}

export default function CustomColorTextField({
                                                 property,
                                                 field,
                                                 color,
                                                 form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                                 ...props
                                             }: CustomColorTextFieldProps)
    : ReactElement {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    return (
        <FormControl
            required={property.validation?.required}
            error={showError}
            disabled={isSubmitting}
            fullWidth>

            <InputLabel>{property.title || field.name}</InputLabel>

            <Input
                style={{ backgroundColor: color }}
                color={"secondary"}
                defaultValue={value}
                onChange={(evt) => {
                    setFieldTouched(field.name);
                    setFieldValue(
                        field.name,
                        evt.target.value
                    );
                }}
            />

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

            <FieldDescription property={property}/>

        </FormControl>
    );

}
