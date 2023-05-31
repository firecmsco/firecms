import React from "react";

import { Box, InputLabel, Typography } from "@mui/material";
import { fieldBackgroundDisabled } from "../../util/field_colors";

export function DisabledTextField<T extends string | number>({
                                                                 label,
                                                                 small,
                                                                 value
                                                             }: {
    label: React.ReactNode,
    small?: boolean,
    value: T
}) {
    return <Box sx={theme => ({
        position: "relative",
        background: fieldBackgroundDisabled,
        borderRadius: `${theme.shape.borderRadius}px`,
        maxWidth: "100%",
        minHeight: small ? "48px" : "64px",
        color: theme.palette.text.disabled
    })}>
        <InputLabel
            shrink={Boolean(value)}
            sx={{
                position: "absolute",
                color: theme => theme.palette.text.disabled,
                left: 0,
                top: "4px",
                pointerEvents: "none"
            }}
            variant={"filled"}>{label}</InputLabel>
        <Box sx={{
            padding: label ? "32px 12px 8px 12px" : (small ? "12px" : "8px 12px 8px 12px"),
            overflow: "auto"
        }}>
            <Typography variant={"body1"}
                        sx={{
                            fontFamily: "inherit"
                        }}>{value}</Typography>
        </Box>
    </Box>;
}
