import React from "react";
import { Property, ResolvedProperty } from "../../types";
import { getIconForProperty } from "../../core/util/property_utils";
import { Box, SxProps, Theme, Typography } from "@mui/material";

interface LabelWithIconProps {
    property: Property | ResolvedProperty;
    small?: boolean;
    sx?: SxProps<Theme>;
}

/**
 * Render the label of a form field for a given property, with the corresponding
 * icon
 * @category Form custom fields
 */
export function LabelWithIcon({
                                  property,
                                  small,
                                  sx
                              }: LabelWithIconProps) {
    const required = property.validation?.required;

    return (
        <Box sx={{
            display: "flex",
            paddingBottom: "2px",
            alignItems: "center",
            gap: small ? 1 : 1.5,
            ...sx
        }} component={"span"}>

            {getIconForProperty(property)}
            <Typography component={"span"}
                        sx={{
                            fontWeight: 500,
                            fontSize: small ? "1rem" : ".85rem",
                            transformOrigin: "left top",
                            transform: small ? "translate(8px, 0px) scale(0.75)" : undefined
                        }}>{property.name}&nbsp;{required && "*"}</Typography>
            {/*{required && <span aria-hidden="true"*/}
            {/*                   className="MuiInputLabel-asterisk MuiFormLabel-asterisk">*</span>}*/}

        </Box>
    );
}
