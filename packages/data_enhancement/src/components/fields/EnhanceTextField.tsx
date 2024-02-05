import React from "react";
import equal from "react-fast-compare"

import { FieldHelperText, FieldProps, getIconForProperty, LabelWithIcon, useClearRestoreValue } from "@firecms/core";
import { AdvancedTextField, InputType } from "./AdvancedTextField";

/**
 * Generic text field.
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export const EnhanceTextFieldBinding = React.memo(function EnhanceTextFieldBinding<T extends string | number>({
                                                                                                                  value,
                                                                                                                  setValue,
                                                                                                                  error,
                                                                                                                  showError,
                                                                                                                  disabled,
                                                                                                                  autoFocus,
                                                                                                                  property,
                                                                                                                  propertyKey,
                                                                                                                  includeDescription,
                                                                                                                  highlight
                                                                                                              }: FieldProps<T> & {
    highlight?: string
}) {

    let multiline: boolean | undefined = false;
    if (property.dataType === "string") {
        multiline = (property.multiline || property.markdown) ?? false;
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const internalValue: T = value ?? (property.dataType === "string" ? "" : value === 0 ? 0 : "");

    return (<>
            <AdvancedTextField
                inputType={(property.dataType === "number" ? "number" : "text") as InputType<T>}
                label={<LabelWithIcon icon={getIconForProperty(property)}
                                      title={(property.name ?? "") + (property.validation?.required ? " *" : "")}
                />}
                value={internalValue}
                multiline={multiline}
                highlight={highlight}
                setValue={setValue}
                disabled={disabled}
                error={showError}
            />

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
