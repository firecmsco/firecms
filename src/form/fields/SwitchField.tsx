import { FormControlLabel, FormHelperText, Switch } from "@material-ui/core";
import React from "react";

import { CMSFieldProps } from "./form_props";

type SwitchFieldProps = CMSFieldProps<boolean>;

export default function SwitchField({
                                        field,
                                        form: { isSubmitting, setFieldValue },
                                        property,
                                        includeDescription,
                                        ...props
                                    }: SwitchFieldProps) {

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
        </React.Fragment>
    );
}

