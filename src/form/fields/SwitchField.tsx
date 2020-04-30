import {
    BooleanProperty,
    EnumType,
    NumberProperty,
    StringProperty
} from "../../models";
import { Field } from "formik";
import { FormControlLabel, FormHelperText, Switch } from "@material-ui/core";
import React from "react";
import { CMSFieldProps } from "./CMSFieldProps";


interface SwitchFieldProps extends CMSFieldProps<boolean, BooleanProperty> {
}


export default function SwitchField({ name, property, includeDescription }: SwitchFieldProps) {

    return (
        <React.Fragment>
            <FormControlLabel
                control={
                    <Field
                        required={property.validation?.required}
                        component={({
                                        disabled,
                                        field,
                                        form: { isSubmitting },
                                        type,
                                        ...props
                                    }: any) => {
                            return <Switch
                                disabled={disabled || isSubmitting} {...props}{...field} />;
                        }}
                        type={"checkbox"}
                        name={name}
                    />
                }
                disabled={property.disabled}
                label={property.title || name}
            />
            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>}
        </React.Fragment>
    );
}
