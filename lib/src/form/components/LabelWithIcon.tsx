import React from "react";
import { Property, ResolvedProperty } from "../../models";
import { getIconForProperty } from "../../core/util/property_utils";
import { Typography } from "@mui/material";

interface LabelWithIconProps {
    property: Property | ResolvedProperty;
    small?: boolean;
}

/**
 * Render the label of a form field for a given property, with the corresponding
 * icon
 * @category Form custom fields
 */
export function LabelWithIcon({
                                  property,
                                  small
                              }: LabelWithIconProps) {
    const required = property.validation?.required;

    return (
        <Typography color={"textSecondary"} component={"span"}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        transformOrigin: "left top",
                        transform: small ? "translate(8px, 0px) scale(0.75)" : undefined
        }}>
            {getIconForProperty(property)}
            <span style={{ paddingLeft: "12px" }}>{property.name}</span>
            {required && <span aria-hidden="true"
                               className="MuiInputLabel-asterisk MuiFormLabel-asterisk">*</span>}

        </Typography>
    );
}
