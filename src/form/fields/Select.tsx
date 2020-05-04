import { EnumType, EnumValues } from "../../models";
import { getIn } from "formik";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import React from "react";

import { CMSFieldProps } from "./form_props";

type SelectProps<T extends EnumType> = CMSFieldProps<T>;

export default function Select<T extends EnumType>({
                                                       field,
                                                       form: { isSubmitting, errors, touched, setFieldValue },
                                                       property,
                                                       includeDescription,
                                                       ...props
                                                   }: SelectProps<T>) {

    const enumValues = property.enumValues as EnumValues<T>;

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;
    return (
        <FormControl
            fullWidth
            required={property.validation?.required}
            error={showError}
        >
            <InputLabel
                id={`${field.name}-label`}>{property.title || field.name}</InputLabel>

            <MuiSelect labelId={`${field.name}-label`}
                       value={!!value ? value : ""}
                       onChange={(evt: any) => {
                           const newValue = evt.target.value;
                           return setFieldValue(
                               field.name,
                               newValue ? newValue : null
                           );
                       }}
                       {...props}>

                {Object.entries(enumValues).map(([key, value]) => (
                    <MenuItem key={`select-${key}`}
                              value={key}>{value as string}</MenuItem>
                ))}
            </MuiSelect>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>}

            <FormHelperText>{fieldError}</FormHelperText>

        </FormControl>
    );
}
