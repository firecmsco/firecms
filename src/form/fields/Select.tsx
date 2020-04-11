import {
    EnumType,
    EnumValues,
    NumberProperty,
    StringProperty
} from "../../models";
import { Field, getIn } from "formik";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import React from "react";

interface SelectProps<T extends EnumType> {
    name: T,
    property: StringProperty | NumberProperty,
    includeDescription: boolean,
}

export default function Select<T extends EnumType>({ name, property, includeDescription }: SelectProps<T>) {

    const enumValues = property.enumValues as EnumValues<T>;
    return (
        <Field
            name={`${name}`}>
            {({
                  field,
                  form: { isSubmitting, touched, errors, setFieldValue },
                  meta
              }: any) => {

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
                            id={`${name}-label`}>{property.title || name}</InputLabel>
                        <MuiSelect labelId={`${name}-label`}
                                   value={!!value ? value : ""}
                                   onChange={(evt: any) => {
                                       const newValue = evt.target.value;
                                       return setFieldValue(
                                           `${name}`,
                                           newValue ? newValue : null
                                       );
                                   }}>
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
            }
        </Field>
    );
}
