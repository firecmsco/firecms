import React from "react";
import equal from "react-fast-compare"

import {
    FieldHelperText,
    FieldProps,
    getIconForProperty,
    LabelWithIconAndTooltip,
    NumberProperty,
    PropertyIdCopyTooltip,
    StringProperty,
    useClearRestoreValue
} from "@firecms/core";
import { AdvancedTextField } from "./AdvancedTextField";

/**
 * Generic text field.
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export const EnhanceTextFieldBinding = React.memo(function EnhanceTextFieldBinding({
                                                                                                                  propertyKey,
                                                                                                                  value,
                                                                                                                  setValue,
                                                                                                                  error,
                                                                                                                  showError,
                                                                                                                  disabled,
                                                                                                                  autoFocus,
                                                                                                                  property,
                                                                                                                  includeDescription,
                                                                                                                  highlight,
                                                                                                                  size
                                                                                                              }: FieldProps<StringProperty | NumberProperty> & {
    highlight?: string
}) {

    let multiline: boolean | undefined = false;
    if (property.type === "string") {
        multiline = (property.multiline || property.markdown) ?? false;
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const internalValue:string | number | null = value ?? (property.type === "string" ? "" : value === 0 ? 0 : "");

    return (
        <>
            <PropertyIdCopyTooltip propertyKey={propertyKey}>
                <AdvancedTextField
                    inputType={property.type === "number" ? "number" : "text"}
                    label={<LabelWithIconAndTooltip
                        propertyKey={propertyKey}
                        icon={getIconForProperty(property)}
                        title={(property.name ?? "") + (property.validation?.required ? " *" : "")}
                    />}
                    value={internalValue}
                    multiline={multiline}
                    highlight={highlight}
                    setValue={setValue}
                    disabled={disabled}
                    error={showError}
                    size={size}
                />

            </PropertyIdCopyTooltip>
            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>
        </>
    );

}, (prevProps, nextProps) => {
    return prevProps.value === nextProps.value &&
        prevProps.error === nextProps.error &&
        prevProps.showError === nextProps.showError &&
        prevProps.disabled === nextProps.disabled &&
        equal(prevProps.property, nextProps.property) &&
        prevProps.highlight === nextProps.highlight;
});
