import { getIn } from "formik";
import {
    FormControl,
    FormHelperText,
    Input,
    InputLabel
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { CMSFieldProps } from "../../../src/form";

export default function CustomLargeTextField({
                                                 property,
                                                 field,
                                                 form: { isSubmitting, errors, touched, setFieldValue },
                                                 ...props
                                             }: CMSFieldProps<string>)
    : ReactElement {
    console.log("CustomLargeTextField");

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
                    rows={4}
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
