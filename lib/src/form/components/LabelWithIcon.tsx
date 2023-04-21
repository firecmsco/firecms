import React from "react";
import { Box, SxProps, Theme, Typography } from "@mui/material";

interface LabelWithIconProps {

    icon: React.ReactNode;
    title?: string;
    small?: boolean;
    sx?: SxProps<Theme>;
}

/**
 * Render the label of a form field for a given property, with the corresponding
 * icon
 * @category Form custom fields
 */
export function LabelWithIcon({
                                  icon,
                                  title,
                                  small,
                                  sx
                              }: LabelWithIconProps) {
    return (
        <Box sx={{
            display: "inline-flex",
            marginBottom: "2px",
            alignItems: "center",
            gap: small ? 1 : 1.5,
            ...sx
        }} component={"span"}>

            {icon}
            <Typography component={"span"}
                        sx={{
                            fontWeight: 500,
                            fontSize: small ? "1rem" : ".85rem",
                            transformOrigin: "left top",
                            transform: small ? "translate(8px, 0px) scale(0.75)" : undefined
                        }}>{title}</Typography>

        </Box>
    );
}
