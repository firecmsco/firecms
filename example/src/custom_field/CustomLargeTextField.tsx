import { getIn } from "formik";
import {
    FormControl,
    FormHelperText,
    Input,
    InputLabel
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { CMSFieldProps } from "@camberi/firecms";

interface CustomLargeTextFieldProps extends CMSFieldProps<string> {
    rows: number
}

export default function CustomLargeTextField({
                                                 property,
                                                 field,
                                                 rows,
                                                 form: { isSubmitting, errors, touched, setFieldValue },
                                                 ...props
                                             }: CustomLargeTextFieldProps)
    : ReactElement {

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    return (
        <React.Fragment>

            <FormControl
                required={property.validation?.required}
                error={showError}
                disabled={isSubmitting}
                fullWidth>
                <InputLabel>{property.title || field.name}</InputLabel>
                <Input
                    multiline
                    rows={rows}
                    defaultValue={value}
                    onChange={(evt) => setFieldValue(
                        field.name,
                        evt.target.value
                    )}
                />

                {showError && <FormHelperText
                    id="component-error-text">{fieldError}</FormHelperText>}

                {property.description &&
                <FormHelperText>{property.description}</FormHelperText>}

            </FormControl>

        </React.Fragment>
    );

}
