import { EnumType, EnumValues, FieldProps } from "../../models";
import {
    Checkbox,
    FormControl,
    FormHelperText,
    InputLabel,
    ListItemText,
    MenuItem,
    Select as MuiSelect
} from "@material-ui/core";
import React from "react";
import { FieldDescription } from "../../form/components";
import LabelWithIcon from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks";
import { enumToObjectEntries, isEnumValueDisabled } from "../../util/enums";
import { EnumValuesChip } from "../../preview/components/CustomChip";


export default function ArrayEnumSelect({
                                            name,
                                            value,
                                            setValue,
                                            error,
                                            showError,
                                            disabled,
                                            property,
                                            includeDescription
                                        }: FieldProps<EnumType[]>) {

    if (!property.of) {
        throw Error("Using wrong component ArrayEnumSelect");
    }

    if (property.of.dataType !== "string" && property.of.dataType !== "number") {
        throw Error("Field misconfiguration: array field of type string or number");
    }

    const enumValues: EnumValues | undefined = property.of.config?.enumValues;
    if (!enumValues) {
        console.error(property);
        throw Error("Field misconfiguration: array field of type string or number needs to have enumValues");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const validValue = !!value && Array.isArray(value);
    return <FormControl
        fullWidth
        required={property.validation?.required}
        error={showError}
    >
        <div style={{ marginTop: "-4px" }}>
            <InputLabel id={`${name}-multiselect-label`} style={{
                marginLeft: "10px"
            }}>
                <LabelWithIcon property={property}/>
            </InputLabel>
        </div>

        <MuiSelect multiple
                   variant={"filled"}
                   labelId={`${name}-multiselect-label`}
                   value={validValue ? value : []}
                   style={{ minHeight: "64px", padding: "4px" }}
                   disabled={disabled}
                   onChange={(evt: any) => {
                       return setValue(
                           evt.target.value
                       );
                   }}
                   renderValue={(selected: any) => (
                       <div>
                           {selected && selected.map((key: any) => {

                               if (!key) return null;

                               return <EnumValuesChip
                                   key={`array_enum_${key}`}
                                   enumKey={key}
                                   enumValues={enumValues}
                                   small={false}/>;
                           })}
                       </div>
                   )}>


            {enumToObjectEntries(enumValues).map(([enumKey, labelOrConfig]) => {

                const chip = <EnumValuesChip
                    enumKey={enumKey}
                    enumValues={enumValues}
                    small={false}/>;

                return (
                    <MenuItem key={`form-select-${name}-${enumKey}`}
                              value={enumKey}
                              disabled={isEnumValueDisabled(labelOrConfig)}
                              dense={true}>
                        <Checkbox
                            checked={validValue && (value as any[]).includes(enumKey)}/>
                        <ListItemText primary={chip}/>
                    </MenuItem>
                );
            })}

        </MuiSelect>

        <FormHelperText>{error}</FormHelperText>

        {includeDescription &&
        <FieldDescription property={property}/>}

    </FormControl>;
}
