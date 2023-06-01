import React from "react";
import { Box, FormHelperText } from "@mui/material";

import { FieldProps } from "../../types";
import { FieldDescription, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../core";
import { BooleanSwitch } from "../../core/components/fields/BooleanSwitch";

type SwitchFieldProps = FieldProps<boolean>;

/**
 * Simple boolean switch biding to a boolean property.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export const SwitchFieldBinding = React.forwardRef(function SwitchFieldBinding({
                                                                                   propertyKey,
                                                                                   value,
                                                                                   setValue,
                                                                                   error,
                                                                                   showError,
                                                                                   autoFocus,
                                                                                   disabled,
                                                                                   touched,
                                                                                   property,
                                                                                   includeDescription
                                                                               }: SwitchFieldProps, ref) {

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <>

            <BooleanSwitch
                value={value}
                onChange={(e) => setValue(e.target.checked)}
                error={showError}
                label={<LabelWithIcon icon={getIconForProperty(property)}
                                      required={property.validation?.required}
                                      title={property.name}/>}
                disabled={disabled}
                autoFocus={autoFocus}
                small={false}
            />

            {((showError && error) ||
                    (includeDescription && (property.description || property.longDescription))) &&
                <Box display={"flex"}
                     sx={{ marginLeft: "14px" }}
                >
                    {includeDescription &&
                        <FieldDescription property={property}/>}

                    {showError &&
                        <FormHelperText error={true}>{error}</FormHelperText>}
                </Box>}
        </>

    );
});
