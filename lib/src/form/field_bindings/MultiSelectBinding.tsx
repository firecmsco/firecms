import React, { useCallback } from "react";

import { EnumType, FieldProps, ResolvedProperty } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { EnumValuesChip } from "../../preview";
import { enumToObjectEntries, getIconForProperty, Select, SelectItem } from "../../core";
import { IconButton } from "../../components";
import { ClearIcon } from "../../icons";

/**
 * This fields renders a dropdown with multiple selection.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function MultiSelectBinding({
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
                onMultiValueChange={(updatedValue: string[]) => {
                    let newValue: EnumType[] | null;
                    if (of && (of as ResolvedProperty)?.dataType === "number") {
                        newValue = updatedValue ? (updatedValue as string[]).map((e) => parseFloat(e)) : [];
                    } else {
                        newValue = updatedValue;
                    }
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

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </div>
    );
}
