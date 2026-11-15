import React from "react";

import { FieldProps } from "../../types/index.js";
import { getIconForProperty } from "../../util/index.js";
import { FieldHelperText, LabelWithIcon } from "../components/index.js";
import { BooleanSwitchWithLabel, IconButton, CloseIcon } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue.js";
import { PropertyIdCopyTooltip } from "../../components/index.js";

type SwitchFieldProps = FieldProps<boolean>;

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
                                                              }: SwitchFieldProps) {

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <>

            <PropertyIdCopyTooltip propertyKey={propertyKey}>
                <div className="flex items-center">
                    <BooleanSwitchWithLabel
                        value={value}
                        onValueChange={(v) => setValue(v)}
                        error={showError}
                        className={property.widthPercentage !== undefined ? "mt-8" : undefined}
                        label={<LabelWithIcon
                            icon={getIconForProperty(property, "small")}
                            required={property.validation?.required}
                            title={property.name}/>}
                        disabled={disabled}
                        autoFocus={autoFocus}
                        size={size}
                        switchAdornment={
                            (property.nullable || property.clearable) && !disabled && value !== null && (
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setValue(null);
                                    }}
                                    className="mr-2"
                                >
                                    <CloseIcon size={"small"}/>
                                </IconButton>
                            )
                        }
                    />
                </div>
            </PropertyIdCopyTooltip>

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>
        </>

    );
};
