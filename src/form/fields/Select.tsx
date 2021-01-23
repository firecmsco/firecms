import { EnumType, EnumValues } from "../../models";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import React from "react";

import { CMSFieldProps } from "../../models/form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { CustomChip } from "../../preview/components/CustomChip";

type SelectProps<T extends EnumType> = CMSFieldProps<T>;

export default function Select<T extends EnumType>({
                                                       name,
                                                       value,
                                                       setValue,
                                                       error,
                                                       showError,
                                                       isSubmitting,
                                                       autoFocus,
                                                       touched,
                                                       property,
                                                       includeDescription
                                                   }: SelectProps<T>) {

    const enumValues = property.config?.enumValues as EnumValues<T>;

    return (
        <FormControl
            fullWidth
            required={property.validation?.required}
            error={showError}
        >

            <InputLabel id={`${name}-select-label`} style={{
                marginTop: "4px",
                marginLeft: "10px"
            }}>
                <LabelWithIcon property={property}/>
            </InputLabel>

            <MuiSelect
                variant={"filled"}
                labelId={`${name}-select-label`}
                autoFocus={autoFocus}
                value={!!value ? value : ""}
                disabled={isSubmitting}
                onChange={(evt: any) => {
                    const newValue = evt.target.value;
                    return setValue(
                        newValue ? newValue : null
                    );
                }}
                renderValue={(v: any) =>
                    <CustomChip
                        colorKey={typeof v == "number" ? `${name}_${v}` : v as string}
                        label={enumValues[v] || v}
                        error={!enumValues[v]}
                        outlined={false}
                        small={false}/>
                }>

                {Object.entries(enumValues).map(([key, value]) => (
                    <MenuItem key={`select_${name}_${key}`} value={key}>
                        <CustomChip
                            colorKey={typeof key === "number" ? `${name}_${key}` : key as string}
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
                id="component-error-text">{error}</FormHelperText>}

        </FormControl>
    );
}
