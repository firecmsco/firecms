import React, { useCallback } from "react";


import { EnumType, FieldProps, ResolvedProperty } from "../../types";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { EnumValuesChip } from "../../preview";
import { enumToObjectEntries, getIconForProperty, Select, SelectItem } from "../../core";
import { IconButton } from "../../components";
import { FieldHelperText } from "../components/FieldHelperText";
import { ClearIcon } from "../../icons/ClearIcon";

/**
 * This fields renders a dropdown with multiple selection.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayEnumSelectBinding({
                                           propertyKey,
                                           value,
                                           setValue,
                                           error,
                                           showError,
                                           disabled,
                                           property,
                                           includeDescription,
                                           autoFocus
                                       }: FieldProps<EnumType[], any, any>) {

    const of: ResolvedProperty<any> | ResolvedProperty<any>[] = property.of;
    if (!of) {
        throw Error("Using wrong component ArrayEnumSelect");
    }

    if (Array.isArray(of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (of.dataType !== "string" && of.dataType !== "number") {
        throw Error("Field misconfiguration: array field of type string or number");
    }

    const enumValues = enumToObjectEntries(of.enumValues);
    if (!enumValues) {
        console.error(property);
        throw Error("Field misconfiguration: array field of type string or number needs to have enumValues");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleClearClick = useCallback(() => {
        setValue(null);
    }, [setValue]);

    const validValue = !!value && Array.isArray(value);

    console.log("ddd", value);
    return (
        <div className="mt-0.5 ml-0.5  mt-2">


            <Select
                multiple
                value={validValue ? value.map((v) => v.toString()) : []}
                disabled={disabled}
                label={<LabelWithIcon icon={getIconForProperty(property)}
                                      required={property.validation?.required}
                                      title={property.name}
                                      className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>}
                endAdornment={
                    of.clearable ? (
                        <IconButton className="absolute top-3 right-8" onClick={handleClearClick}>
                            <ClearIcon/>
                        </IconButton>
                    ) : null
                }
                onValueChange={(updatedValue: string | string[]) => {
                    let newValue: EnumType[] | null;
                    if (typeof updatedValue === "string") {
                        throw Error("Unexpected string value in ArrayEnumSelectBinding, should be an array");
                    }
                    if (of && (of as ResolvedProperty)?.dataType === "number") {
                        newValue = updatedValue ? (updatedValue as string[]).map((e) => parseFloat(e)) : [];
                    } else {
                        newValue = updatedValue;
                    }
                    console.log("updatedValue", updatedValue, newValue)
                    return setValue(newValue);
                }}
                placeholder={`${propertyKey}-multiselect-label`}
                renderValue={(option: string) => (
                    <EnumValuesChip
                        enumKey={option}
                        enumValues={enumValues}
                        size={"medium"}/>
                )}
            >
                {enumValues.map((enumConfig) => (
                    <SelectItem
                        key={enumConfig.id}
                        value={String(enumConfig.id)}>
                        <EnumValuesChip
                            enumKey={enumConfig.id}
                            enumValues={enumValues}
                            size={"medium"}/>
                    </SelectItem>)
                )}
            </Select>

            {/*<MuiSelect*/}
            {/*    multiple*/}
            {/*    className="min-h-[64px] rounded-[var(--rounded)]"*/}
            {/*    variant={"filled"}*/}
            {/*    labelId={`${propertyKey}-multiselect-label`}*/}
            {/*    value={validValue ? value.map(v => v.toString()) : []}*/}
            {/*    autoFocus={autoFocus}*/}
            {/*    disabled={disabled}*/}
            {/*    disableUnderline={true}*/}
            {/*    endAdornment={*/}
            {/*        of.clearable && <IconButton*/}
            {/*            className="absolute top-3 right-8"*/}
            {/*            onClick={handleClearClick}>*/}
            {/*            <Clear/>*/}
            {/*        </IconButton>*/}
            {/*    }*/}
            {/*    onChange={(evt: any) => {*/}
            {/*        let newValue;*/}
            {/*        if ((of as ResolvedProperty)?.dataType === "number")*/}
            {/*            newValue = evt.target.value ? evt.target.value.map((e: any) => parseFloat(e)) : [];*/}
            {/*        else*/}
            {/*            newValue = evt.target.value;*/}
            {/*        return setValue(*/}
            {/*            newValue*/}
            {/*        );*/}
            {/*    }}*/}
            {/*    renderValue={(selected: any) => (*/}
            {/*        <ArrayEnumPreview value={selected}*/}
            {/*                          name={propertyKey}*/}
            {/*                          enumValues={enumValues}*/}
            {/*                          size={"medium"}/>*/}
            {/*    )}>*/}

            {/*    {enumToObjectEntries(enumValues)*/}
            {/*        .map((enumConfig) => {*/}
            {/*            const enumKey = enumConfig.id;*/}
            {/*            const checked = validValue && value.map(v => v.toString()).includes(enumKey.toString());*/}
            {/*            return (*/}
            {/*                <MenuItem*/}
            {/*                    key={`form-select-${propertyKey}-${enumKey}`}*/}
            {/*                    value={enumKey}*/}
            {/*                    disabled={isEnumValueDisabled(enumConfig)}*/}
            {/*                    dense={true}>*/}
            {/*                    <Checkbox checked={checked}/>*/}
            {/*                    <ListItemText primary={*/}
            {/*                        <EnumValuesChip*/}
            {/*                            enumKey={enumKey}*/}
            {/*                            enumValues={enumValues}*/}
            {/*                            size={"small"}/>*/}
            {/*                    }/>*/}
            {/*                </MenuItem>*/}
            {/*            );*/}
            {/*        })}*/}
            {/*</MuiSelect>*/}

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </div>
    );
}
