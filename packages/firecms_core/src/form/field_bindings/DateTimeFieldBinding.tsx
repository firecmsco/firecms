import React from "react";

import { DateProperty, FieldProps } from "@firecms/types";

import { FieldHelperText, LabelWithIcon } from "../components";
import { useCustomizationController } from "../../hooks";
import { getIconForProperty } from "../../util";
import { DateTimeField } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { PropertyIdCopyTooltip } from "../../components";

type DateTimeFieldProps = FieldProps<DateProperty>;

/**
 * Field that allows selecting a date
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function DateTimeFieldBinding({
    propertyKey,
    value,
    setValue,
    autoFocus,
    error,
    showError,
    disabled,
    touched,
    property,
    includeDescription
}: DateTimeFieldProps) {

    const { locale } = useCustomizationController();
    const internalValue = value || null;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <>
            <PropertyIdCopyTooltip propertyKey={propertyKey}>
                <DateTimeField
                    value={internalValue}
                    onChange={(dateValue) => setValue(dateValue)}
                    size={"large"}
                    mode={property.mode}
                    clearable={property.clearable}
                    locale={locale}
                    timezone={property.timezone}
                    error={showError}
                    disabled={disabled}
                    label={<LabelWithIcon
                        icon={getIconForProperty(property, "small")}
                        required={property.validation?.required}
                        className={showError ? "text-red-500 dark:text-red-500" : "text-text-secondary dark:text-text-secondary-dark"}
                        title={property.name ?? propertyKey} />}
                />
            </PropertyIdCopyTooltip>

            <FieldHelperText includeDescription={includeDescription}
                showError={showError}
                error={error}
                disabled={disabled}
                property={property} />

        </>
    );
}
