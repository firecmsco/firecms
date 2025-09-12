import React from "react";

import { BooleanProperty, FieldProps } from "@firecms/types";
import { getIconForProperty } from "../../util";
import { FieldHelperText, LabelWithIcon } from "../components";
import { BooleanSwitchWithLabel } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { PropertyIdCopyTooltip } from "../../components";


/**
 * Simple boolean switch biding to a boolean property.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export const SwitchFieldBinding = function SwitchFieldBinding({
                                                                  propertyKey,
                                                                  value,
                                                                  setValue,
                                                                  error,
                                                                  showError,
                                                                  autoFocus,
                                                                  disabled,
                                                                  size = "large",
                                                                  property,
                                                                  includeDescription
                                                              }: FieldProps<BooleanProperty>) {

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <>

            <PropertyIdCopyTooltip propertyKey={propertyKey}>
                <BooleanSwitchWithLabel
                    value={value}
                    onValueChange={(v) => setValue(v)}
                    error={showError}
                    className={property.widthPercentage !== undefined ? "mt-8" : undefined}
                    label={<LabelWithIcon
                        icon={getIconForProperty(property, "small")}
                        required={property.validation?.required}
                        title={property.name ?? propertyKey}/>}
                    disabled={disabled}
                    autoFocus={autoFocus}
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
};
