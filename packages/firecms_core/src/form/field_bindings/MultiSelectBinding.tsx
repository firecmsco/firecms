import React, { useCallback } from "react";

import { EnumType, FieldProps, ResolvedProperty } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { EnumValuesChip } from "../../preview";
import { enumToObjectEntries, getIconForProperty, getLabelOrConfigFrom } from "../../core";
import { CloseIcon } from "../../icons";
import { MultiSelect, MultiSelectItem } from "../../components/MultiSelect";

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

    const validValue = !!value && Array.isArray(value);

    const renderValue = useCallback((enumKey: string, list: boolean) => {
        const enumValue = enumKey !== undefined ? getLabelOrConfigFrom(enumValues, enumKey) : undefined;
        return <EnumValuesChip
            enumKey={enumKey}
            enumValues={enumValues}
            size={"medium"}
            key={enumKey}>
            {enumValue?.label ?? enumKey}
            {!list && <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setValue(value.filter(v => v !== enumKey));
                }}
            >
                <CloseIcon size="smallest"/>
            </button>}
        </EnumValuesChip>;
    }, [enumValues, setValue, value]);

    return (
        <div className="mt-0.5 ml-0.5  mt-2">
            <MultiSelect
                value={validValue ? value.map((v) => v.toString()) : []}
                disabled={disabled}
                label={<LabelWithIcon icon={getIconForProperty(property, "small")}
                                      required={property.validation?.required}
                                      title={property.name}
                                      className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>}
                renderValue={useCallback((v: string) => renderValue(v, false), [renderValue])}
                onMultiValueChange={(updatedValue: string[]) => {
                    let newValue: EnumType[] | null;
                    if (of && (of as ResolvedProperty)?.dataType === "number") {
                        newValue = updatedValue ? (updatedValue as string[]).map((e) => parseFloat(e)) : [];
                    } else {
                        newValue = updatedValue;
                    }
                    return setValue(newValue);
                }}>
                {enumValues.map((enumValue) => String(enumValue.id)).map((enumKey) => (
                    <MultiSelectItem key={enumKey} value={enumKey}>
                        {renderValue(enumKey, true)}
                    </MultiSelectItem>))}
            </MultiSelect>

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </div>
    );
}
