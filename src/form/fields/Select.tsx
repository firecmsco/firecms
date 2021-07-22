import { EnumType, EnumValues, FieldProps } from "../../models";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import React from "react";
import { FieldDescription } from "../../form/components";
import LabelWithIcon from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks";
import { enumToObjectEntries, isEnumValueDisabled } from "../../util/enums";
import { EnumValuesChip } from "../../preview/components/CustomChip";

type SelectProps<T extends EnumType> = FieldProps<T>;

/**
 * @category Form fields
 */
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

    const enumValues = property.config?.enumValues as EnumValues;

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
                value={value !== undefined ? value : ""}
                disabled={disabled}
                onChange={(evt: any) => {
                    const eventValue = evt.target.value;
                    const newValue = eventValue ?
                        (property.dataType === "number" ? parseFloat(eventValue) : eventValue)
                        : null;
                    return setValue(newValue);
                }}
                renderValue={(enumKey: any) => {
                    return <EnumValuesChip
                        enumKey={enumKey}
                        enumValues={enumValues}
                        small={false}/>;
                }
                }>

                {enumToObjectEntries(enumValues)
                    .map(([enumKey, labelOrConfig]) => {
                        return (
                            <MenuItem key={`select_${name}_${enumKey}`}
                                      value={enumKey}
                                      disabled={isEnumValueDisabled(labelOrConfig)}>
                                <EnumValuesChip
                                    enumKey={enumKey}
                                    enumValues={enumValues}
                                    small={true}/>
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
