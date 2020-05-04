import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    Switch
} from "@material-ui/core";
import React from "react";

import { CMSFieldProps } from "./form_props";
import { getIn } from "formik";

type SwitchFieldProps = CMSFieldProps<boolean>;

export default function SwitchField({
                                        field,
                                        form: { isSubmitting, errors, touched, setFieldValue },
                                        property,
                                        includeDescription,
                                        ...props
                                    }: SwitchFieldProps) {


    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    return (
        <React.Fragment>
            <FormControlLabel
                checked={field.value}
                control={
                    <Switch
                        {...props}
                        type={"checkbox"}
                        onChange={(evt) => {
                            setFieldValue(
                                field.name,
                                evt.target.checked
                            );
                        }}/>
                }
                disabled={property.disabled || isSubmitting}
                label={property.title || field.name}
            />

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}
        </React.Fragment>
    );
}

