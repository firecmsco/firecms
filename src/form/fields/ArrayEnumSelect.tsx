import { EnumType, EnumValues } from "../../models";
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
import { FieldProps } from "../../models/form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../components/LabelWithIcon";
import { CustomChip } from "../../preview";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { buildEnumLabel, isEnumValueDisabled } from "../../models/builders";

type ArrayEnumSelectProps<T extends EnumType> = FieldProps<T[]>;

export default function ArrayEnumSelect<T extends EnumType>({
                                                                name,
                                                                value,
                                                                setValue,
                                                                error,
                                                                showError,
                                                                disabled,
                                                                touched,
                                                                property,
                                                                includeDescription,
                                                                dependsOnOtherProperties
                                                            }: ArrayEnumSelectProps<T>) {
    if (!("dataType" in property.of)) {
        throw Error("Using wrong component ArrayEnumSelect");
    }

    if (property.of.dataType !== "string" && property.of.dataType !== "number") {
        throw Error("Field misconfiguration: array field of type string or number");
    }

    const enumValues: EnumValues<number | string> | undefined = property.of.config?.enumValues;
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
                           {selected && selected.map((value: any) => {

                               if (!value) return null;

                               const label = buildEnumLabel(enumValues[value]);
                               const key: string = typeof value == "number" ? `${name}_${value}` : value as string;

                               return <CustomChip
                                   key={`select_value_${value}`}
                                   colorKey={key}
                                   label={label || value}
                                   error={!label}
                                   outlined={false}
                                   small={false}/>;
                           })}
                       </div>
                   )}>


            {Object.entries(enumValues).map(([key, enumValue]) => {

                const label = buildEnumLabel(enumValue);
                const chip = <CustomChip
                    colorKey={typeof key === "number" ? `${name}_${key}` : key as string}
                    label={label || key}
                    error={!label}
                    outlined={false}
                    small={false}/>;
                    return (
                        <MenuItem key={`form-select-${name}-${key}`}
                                  value={key}
                                  disabled={isEnumValueDisabled(enumValue)}
                                  dense={true}>
                            <Checkbox
                                checked={validValue && (value as any[]).includes(key)}/>
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
