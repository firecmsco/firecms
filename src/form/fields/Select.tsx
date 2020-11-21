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

import { CMSFieldProps } from "../form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { CustomChip } from "../../preview/components/CustomChip";

type SelectProps<T extends EnumType> = CMSFieldProps<T>;

export default function Select<T extends EnumType>({
                                                       name,
                                                       field,
                                                       form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                                       property,
                                                       includeDescription
                                                   }: SelectProps<T>) {

    const enumValues = property.config?.enumValues as EnumValues<T>;

    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;
    return (
        <FormControl
            fullWidth
            required={property.validation?.required}
            error={showError}
        >

            <InputLabel id={`${field.name}-select-label`} style={{
                marginTop: "4px",
                marginLeft: "10px"
            }}>
                <LabelWithIcon property={property}/>
            </InputLabel>

            <MuiSelect
                variant={"filled"}
                labelId={`${field.name}-select-label`}
                value={!!value ? value : ""}
                disabled={isSubmitting}
                onChange={(evt: any) => {
                    const newValue = evt.target.value;
                    setFieldTouched(field.name);
                    return setFieldValue(
                        field.name,
                        newValue ? newValue : null
                    );
                }}
                renderValue={(v: any) =>
                    <CustomChip
                        colorKey={typeof v == "number" ? `${field.name}_${v}` : v as string}
                        label={enumValues[v] || v}
                        error={!enumValues[v]}
                        outlined={false}
                        small={false}/>
                }>

                {Object.entries(enumValues).map(([key, value]) => (
                    <MenuItem key={`select-${key}`} value={key}>
                        <CustomChip
                            colorKey={field.name}
                            label={value as string}
                            error={!value}
                            outlined={false}
                            small={false}/>
                    </MenuItem>
                ))}
            </MuiSelect>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

        </FormControl>
    );
}
