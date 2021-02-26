import { EnumType, EnumValues } from "../../models";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import React from "react";

import { FieldProps } from "../../models/form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../components/LabelWithIcon";
import { CustomChip } from "../../preview";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { EnumValueConfig } from "../../models/models";
import { buildEnumLabel, isEnumValueDisabled } from "../../models/builders";

type SelectProps<T extends EnumType> = FieldProps<T>;

export default function Select<T extends EnumType>({
                                                       name,
                                                       value,
                                                       setValue,
                                                       error,
                                                       showError,
                                                       disabled,
                                                       autoFocus,
                                                       touched,
                                                       property,
                                                       includeDescription,
                                                       dependsOnOtherProperties
                                                   }: SelectProps<T>) {

    const enumValues = property.config?.enumValues as EnumValues<T>;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <FormControl
            fullWidth
            required={property.validation?.required}
            error={showError}
            disabled={disabled}
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
                disabled={disabled}
                onChange={(evt: any) => {
                    const eventValue = evt.target.value;
                    const newValue = eventValue ?
                        (property.dataType === "number" ? parseFloat(eventValue) : eventValue)
                        : null;
                    return setValue(
                        newValue
                    );
                }}
                renderValue={(v: any) => {
                    const label = buildEnumLabel(enumValues[v]);
                    return <CustomChip
                        colorKey={typeof v === "number" ? `${name}_${v}` : v as string}
                        label={label || v}
                        error={!label}
                        outlined={false}
                        small={false}/>;
                }
                }>

                {Object.entries<string | EnumValueConfig>(enumValues)
                    .map(([key, value]) => {
                        const label = buildEnumLabel(value);
                        return (
                            <MenuItem key={`select_${name}_${key}`}
                                      value={key}
                                      disabled={isEnumValueDisabled(value)}>
                                <CustomChip
                                    colorKey={typeof key === "number" ? `${name}_${key}` : key as string}
                                    label={label || key}
                                    error={!label}
                                    outlined={false}
                                    small={false}/>
                            </MenuItem>
                        );
                    })}
            </MuiSelect>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{error}</FormHelperText>}

        </FormControl>
    );
}
